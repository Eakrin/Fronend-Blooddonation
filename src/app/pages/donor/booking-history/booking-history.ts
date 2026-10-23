import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, RouterModule],
  templateUrl: './booking-history.html',
  styleUrl: './booking-history.css',
})
export class BookingHistory implements OnInit {
  bookings: any[] = [];
  isLoading = true;

  // ตัวกรองรายการ: all = ทั้งหมด, success = บริจาคสำเร็จ, waiting = รอดำเนินการ, other = ยกเลิก/อื่นๆ
  filter: 'all' | 'success' | 'waiting' | 'other' = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    const token = localStorage.getItem('token');
    this.http
      .get(environment.apiUrl + '/api/booking', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res: any) => {
          this.bookings = res;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  // จัดกลุ่มสถานะเพื่อใช้กับตัวกรองและตัวเลขสรุป
  private group(b: any): 'success' | 'waiting' | 'other' {
    const key = this.statusKey(b);
    if (key === 'completed') return 'success';
    if (key === 'pending' || key === 'approved') return 'waiting';
    return 'other';
  }

  countOf(g: 'success' | 'waiting' | 'other'): number {
    return this.bookings.filter((b) => this.group(b) === g).length;
  }

  get filtered(): any[] {
    if (this.filter === 'all') return this.bookings;
    return this.bookings.filter((b) => this.group(b) === this.filter);
  }

  cancelBooking(bookingId: number) {
    if (!confirm('ต้องการยกเลิกการจองนี้ใช่ไหม?')) return;
    const token = localStorage.getItem('token');
    this.http
      .put(
        `${environment.apiUrl}/api/booking/cancel/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .subscribe({
        next: () => {
          this.loadBookings();
        },
        error: (err: any) => {
          alert(err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  // ถ้ามีผลบันทึกการบริจาคแล้ว ให้ใช้ donation_status แทน booking_status
  statusKey(b: any): string {
    if (b.booking_status === 'cancelled') return 'cancelled';
    if (b.donation_status === 'completed') return 'completed';
    if (b.donation_status === 'deferred') return 'deferred';
    if (b.donation_status === 'incomplete') return 'incomplete';
    return b.booking_status;
  }

  getStatusLabel(b: any): string {
    const key = this.statusKey(b);
    const map: any = {
      pending: 'รอพิจารณา',
      approved: 'ผ่านการอนุมัติ',
      rejected: 'ไม่ผ่านเกณฑ์',
      cancelled: 'ยกเลิกแล้ว',
      completed: 'บริจาคสำเร็จ',
      deferred: 'เลื่อนบริจาค',
      incomplete: 'บริจาคไม่สำเร็จ',
    };
    let label = map[key] || key;
    if (key === 'completed' && b.blood_volume) {
      label += ` (${b.blood_volume} ml)`;
    }
    return label;
  }

  getStatusIcon(b: any): string {
    const map: any = {
      completed: 'volunteer_activism',
      approved: 'check_circle',
      pending: 'hourglass_empty',
      rejected: 'cancel',
      deferred: 'event_busy',
      incomplete: 'error',
      cancelled: 'block',
    };
    return map[this.statusKey(b)] || 'block';
  }
}
