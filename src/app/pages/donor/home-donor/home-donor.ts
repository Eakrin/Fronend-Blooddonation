import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
  hemoglobin = '-'; // หมายเหตุ: ไม่มีคอลัมน์เก็บค่านี้ใน ER ปัจจุบัน คงเป็น "-" ตลอด
  bookings: any[] = [];
  showAllBookings = false;

  // ✅ ใหม่: ผลประเมินสุขภาพล่าสุด ดึงจาก Health_Assessment.result_status จริง
  // null = ยังไม่เคยประเมิน (แสดงเหลือง), 'pass' = เขียว, 'fail' = แดง, 'pending' = เหลือง
  assessmentStatus: 'pass' | 'fail' | 'pending' | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.userName = parsed.name + ' ' + (parsed.lastname || '');
    }
    this.loadBookings();
    this.loadHealthSummary();
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
        },
        error: () => {},
      });
  }

  // ✅ ใหม่: ดึงผลประเมินสุขภาพล่าสุด + ความดันโลหิตล่าสุด มาแทนของ hardcode เดิม
  loadHealthSummary() {
    const token = localStorage.getItem('token');
    this.http
      .get<any>(environment.apiUrl + '/api/health-assessment/latest-summary', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          this.assessmentStatus = res.result_status;
          this.bloodPressure = res.pressure || '-';
        },
        error: () => {
          // โหลดไม่สำเร็จ ปล่อยเป็นค่า default (เหลือง/ไม่มีข้อมูล) ไม่บล็อกหน้าอื่น
        },
      });
  }

  // ✅ ใหม่: label + class ของ badge ผลประเมิน (เขียว/แดง/เหลือง)
  get assessmentLabel(): string {
    if (this.assessmentStatus === 'pass')
      return 'ร่างกายพร้อมสำหรับการบริจาคเบื้องต้น';
    if (this.assessmentStatus === 'fail')
      return 'ยังไม่ผ่านเกณฑ์การบริจาคในครั้งล่าสุด';
    return 'ยังไม่มีผลการประเมิน กรุณาทำแบบประเมินก่อน';
  }

  get assessmentClass(): string {
    if (this.assessmentStatus === 'pass') return 'status-badge-pass';
    if (this.assessmentStatus === 'fail') return 'status-badge-fail';
    return 'status-badge-pending';
  }

  get assessmentIcon(): string {
    if (this.assessmentStatus === 'pass') return 'check_circle';
    if (this.assessmentStatus === 'fail') return 'cancel';
    return 'schedule';
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
    // ✅ แก้ไข: route จริงของ backend คือ PUT /api/booking/cancel/:booking_id
    // (ก่อนหน้านี้ยิง DELETE /api/booking/:id ซึ่งไม่ตรงกับ route ไหนเลย เลย error "เกิดข้อผิดพลาด")
    this.http
      .put(
        `${environment.apiUrl}/api/booking/cancel/${bookingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
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
