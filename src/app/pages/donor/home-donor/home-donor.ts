import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home-donor',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor, DatePipe],
  templateUrl: './home-donor.html',
  styleUrl: './home-donor.css',
})
export class HomeDonor implements OnInit {
  userName = '';
  bloodPressure = '-';
  hemoglobin = '-';
  bookings: any[] = [];
  showAllBookings = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.userName = parsed.name + ' ' + (parsed.lastname || '');
    }
    this.loadBookings();
  }

  loadBookings() {
    const token = localStorage.getItem('token');
    this.http
      .get('http://localhost:3000/api/booking', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res: any) => {
          this.bookings = res;
        },
        error: () => {},
      });
  }

  // เช็คว่ามีการจองที่ active อยู่ไหม
  get hasActiveBooking(): boolean {
    return this.bookings.some((b) => b.booking_status !== 'cancelled');
  }

  // เช็คว่าจองถี่เกินไปไหม (ต้องห่างกัน 56 วัน = 8 สัปดาห์)
  get lastDonationWarning(): string {
    const active = this.bookings
      .filter((b) => b.booking_status !== 'cancelled')
      .sort(
        (a, b) =>
          new Date(b.booking_datetime).getTime() -
          new Date(a.booking_datetime).getTime(),
      );

    if (active.length === 0) return '';

    const last = new Date(active[0].booking_datetime);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 56) {
      const remaining = 56 - diffDays;
      return `ตามเกณฑ์สภากาชาดไทย ท่านต้องรอ ${remaining} วัน ก่อนบริจาคครั้งถัดไป (บริจาคโลหิตรวมห่างกันอย่างน้อย 8 สัปดาห์)`;
    }
    return '';
  }

  get displayedBookings(): any[] {
    return this.showAllBookings ? this.bookings : this.bookings.slice(0, 2);
  }

  cancelBooking(bookingId: number) {
    if (!confirm('ต้องการยกเลิกการจองนี้ใช่ไหม?')) return;
    const token = localStorage.getItem('token');
    this.http
      .delete(`http://localhost:3000/api/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (err) => {
          alert(err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  getStatusLabel(status: string): string {
    const map: any = {
      pending: 'รอพิจารณา',
      approved: 'ผ่านการอนุมัติ',
      rejected: 'ไม่ผ่านเกณฑ์',
      cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: any = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
    };
    return map[status] || '';
  }
}
