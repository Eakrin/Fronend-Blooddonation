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
  bookings: any[] = [];
  showAllBookings = false;

  // null = ยังไม่เคยประเมิน, 'pass' = เขียว, 'fail' = แดง, 'pending' = เหลือง
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

  loadHealthSummary() {
    const token = localStorage.getItem('token');
    this.http
      .get<any>(environment.apiUrl + '/api/health-assessment/latest-summary', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          this.assessmentStatus = res.result_status;
        },
        error: () => {},
      });
  }

  get assessmentLabel(): string {
    if (this.assessmentStatus === 'pass')
      return 'ร่างกายพร้อมสำหรับการบริจาคเบื้องต้น';
    if (this.assessmentStatus === 'fail')
      return 'ยังไม่ผ่านเกณฑ์การบริจาคในครั้งล่าสุด';
    if (this.assessmentStatus === 'pending')
      return 'รอเจ้าหน้าที่พิจารณาผลการประเมิน';
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

  // การจองที่ยังต้องดำเนินการอยู่ (รอพิจารณา/อนุมัติ และยังไม่ถูกบันทึกการบริจาค)
  get hasActiveBooking(): boolean {
    return this.bookings.some(
      (b) =>
        (b.booking_status === 'pending' || b.booking_status === 'approved') &&
        !b.donation_status,
    );
  }

  // ── ประวัติและสถิติการบริจาค (นับเฉพาะที่บริจาคสำเร็จจริง) ──
  get completed(): any[] {
    return this.bookings
      .filter((b) => b.donation_status === 'completed' && b.donated_at)
      .sort(
        (a, b) =>
          new Date(b.donated_at).getTime() - new Date(a.donated_at).getTime(),
      );
  }

  get donationCount(): number {
    return this.completed.length;
  }

  get lastDonationDate(): Date | null {
    return this.completed.length
      ? new Date(this.completed[0].donated_at)
      : null;
  }

  // บริจาคครั้งถัดไปได้ = ครั้งล่าสุด + 90 วัน (3 เดือน)
  get nextEligibleDate(): Date | null {
    const last = this.lastDonationDate;
    if (!last) return null;
    return new Date(last.getTime() + 90 * 24 * 60 * 60 * 1000);
  }

  get daysLeft(): number {
    const last = this.lastDonationDate;
    if (!last) return 0;
    const diffDays = Math.floor(
      (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(0, 90 - diffDays);
  }

  get canDonateNow(): boolean {
    return this.daysLeft === 0;
  }

  // % ความคืบหน้าของวงแหวนนับถอยหลัง (เต็ม 100 = ครบ 90 วันแล้ว)
  get cooldownPercent(): number {
    if (!this.lastDonationDate) return 100;
    return Math.min(100, Math.round(((90 - this.daysLeft) / 90) * 100));
  }

  // นับ 90 วัน (3 เดือน) จากวันที่บริจาคสำเร็จจริงเท่านั้น
  get lastDonationWarning(): string {
    if (this.canDonateNow) return '';
    return `ตามเกณฑ์สภากาชาดไทย ท่านต้องรอ ${this.daysLeft} วัน ก่อนบริจาคครั้งถัดไป (บริจาคโลหิตรวมห่างกันอย่างน้อย 3 เดือน)`;
  }

  get displayedBookings(): any[] {
    return this.showAllBookings ? this.bookings : this.bookings.slice(0, 2);
  }

  cancelBooking(bookingId: number) {
    if (!confirm('ต้องการยกเลิกการจองนี้ใช่ไหม?')) return;
    const token = localStorage.getItem('token');
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

  // สถานะรวม: ถ้ามีผลบันทึกการบริจาคแล้วใช้ donation_status แทน
  private statusKey(b: any): string {
    if (b.booking_status === 'cancelled') return 'cancelled';
    if (b.donation_status === 'completed') return 'completed';
    if (b.donation_status === 'deferred') return 'deferred';
    if (b.donation_status === 'incomplete') return 'incomplete';
    return b.booking_status;
  }

  getBookingLabel(b: any): string {
    const map: any = {
      pending: 'รอพิจารณา',
      approved: 'ผ่านการอนุมัติ',
      rejected: 'ไม่ผ่านเกณฑ์',
      cancelled: 'ยกเลิก',
      completed: 'บริจาคสำเร็จ',
      deferred: 'เลื่อนบริจาค',
      incomplete: 'บริจาคไม่สำเร็จ',
    };
    const key = this.statusKey(b);
    return map[key] || key;
  }

  getBookingClass(b: any): string {
    const map: any = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
      cancelled: 'status-cancelled',
      completed: 'status-approved',
      deferred: 'status-pending',
      incomplete: 'status-rejected',
    };
    return map[this.statusKey(b)] || '';
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
