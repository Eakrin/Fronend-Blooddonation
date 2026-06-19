import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, RouterModule],
  templateUrl: './booking-history.html',
  styleUrl: './booking-history.css',
})
export class BookingHistory implements OnInit {
  bookings: any[] = [];
  isLoading = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
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
          this.bookings = res; // ✅ แสดงทุก status
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
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
        error: (err: any) => {
          alert(err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }

  getStatusLabel(status: string): string {
    const map: any = {
      pending: 'รอพิจารณา',
      approved: 'ผ่านการอนุมัติ',
      rejected: 'ไม่ผ่านเกณฑ์',
      cancelled: 'ยกเลิกแล้ว',
    };
    return map[status] || status;
  }
}
