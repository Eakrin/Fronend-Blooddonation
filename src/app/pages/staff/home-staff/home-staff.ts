import { NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home-staff',
  standalone: true,
  imports: [NgIf, FormsModule, NgFor, DatePipe, RouterLink], // ✅ เพิ่ม RouterLink
  templateUrl: './home-staff.html',
  styleUrl: './home-staff.css',
})
export class HomeStaff implements OnInit {
  bookings: any[] = [];
  searchText = '';
  filterStatus = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.isLoading = true;
    const token = localStorage.getItem('token');
    this.http
      .get(environment.apiUrl + '/api/booking/all', {
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

  get filteredBookings() {
    return this.bookings.filter((b) => {
      const matchSearch =
        !this.searchText ||
        `${b.name} ${b.lastname}`
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        b.phone?.includes(this.searchText);
      const matchStatus =
        !this.filterStatus || b.booking_status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  updateStatus(bookingId: number, status: string) {
    const token = localStorage.getItem('token');
    this.http
      .put(
        `${environment.apiUrl}/api/booking/${bookingId}/status`,
        { booking_status: status },
        { headers: { Authorization: `Bearer ${token}` } },
      )
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
      approved: 'อนุมัติ',
      rejected: 'ไม่ผ่านเกณฑ์',
      cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  // ✅ ใหม่: label ของผลคัดกรองสุขภาพที่ผูกมากับ booking นี้
  // ค่าที่เป็นไปได้ตรงกับ ENUM จริงของ Health_Assessment: 'pass' / 'fail' / 'pending'
  getAssessmentLabel(status: string | null): string {
    const map: any = {
      pass: 'ผ่าน',
      pending: 'เหลือง (ต้องพิจารณา)',
      fail: 'ไม่ผ่าน',
    };
    return status ? map[status] || status : 'ไม่มีข้อมูล';
  }

  getInitials(name: string, lastname: string): string {
    return `${name?.charAt(0) || ''}${lastname?.charAt(0) || ''}`;
  }

  get totalToday(): number {
    return this.bookings.filter((b) => b.booking_status !== 'cancelled').length;
  }

  get totalApproved(): number {
    return this.bookings.filter((b) => b.booking_status === 'approved').length;
  }

  get totalPending(): number {
    return this.bookings.filter((b) => b.booking_status === 'pending').length;
  }
}
