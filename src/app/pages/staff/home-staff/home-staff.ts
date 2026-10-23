import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface LocationGroup {
  name: string;
  total: number;
  pending: number;
  approved: number;
  overdue: number;
}

@Component({
  selector: 'app-home-staff',
  standalone: true,
  imports: [NgIf, FormsModule, NgFor, DatePipe, RouterLink],
  templateUrl: './home-staff.html',
  styleUrl: './home-staff.css',
})
export class HomeStaff implements OnInit {
  bookings: any[] = [];
  searchText = '';
  // แท็บสถานะ: '' = ทั้งหมด, 'pending' = รอพิจารณา, 'approved' = อนุมัติแล้ว, 'other' = ไม่ผ่าน/ยกเลิก
  filterStatus = '';
  filterDate = ''; // รูปแบบ yyyy-MM-dd
  isLoading = false;

  // สถานที่ที่เลือกดูอยู่ (null = หน้าเลือกสถานที่)
  selectedLocation: string | null = null;
  locationSearch = '';

  // แบ่งหน้า: รองรับกรณีมีผู้จองจำนวนมาก
  page = 1;
  readonly pageSize = 10;

  // ── หน้าต่างดูคำตอบแบบประเมิน ──
  answersOpen = false;
  answersLoading = false;
  answersBooking: any = null;
  answersData: any = null;

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

  // ── แยกตามสถานที่ ──
  locationOf(b: any): string {
    return b.location_name || 'ไม่ระบุสถานที่';
  }

  // รายการจองในขอบเขตที่เลือกอยู่ (ทุกสถานที่ หรือเฉพาะสถานที่ที่เลือก)
  get scoped(): any[] {
    if (!this.selectedLocation) return this.bookings;
    return this.bookings.filter(
      (b) => this.locationOf(b) === this.selectedLocation,
    );
  }

  // การ์ดสถานที่ (เรียงสถานที่ที่มีงานค้างขึ้นก่อน)
  get locationGroups(): LocationGroup[] {
    const map = new Map<string, LocationGroup>();
    for (const b of this.bookings) {
      const name = this.locationOf(b);
      if (!map.has(name)) {
        map.set(name, { name, total: 0, pending: 0, approved: 0, overdue: 0 });
      }
      const g = map.get(name)!;
      if (b.booking_status !== 'cancelled') g.total++;
      if (b.booking_status === 'pending') g.pending++;
      if (b.booking_status === 'approved') g.approved++;
      if (this.isOverdue(b)) g.overdue++;
    }
    const q = this.locationSearch.trim().toLowerCase();
    return Array.from(map.values())
      .filter((g) => !q || g.name.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          b.overdue - a.overdue ||
          b.pending - a.pending ||
          a.name.localeCompare(b.name, 'th'),
      );
  }

  selectLocation(name: string) {
    this.selectedLocation = name;
    this.clearFilters();
  }

  backToLocations() {
    this.selectedLocation = null;
    this.clearFilters();
  }

  // วันที่ (ตามเวลาท้องถิ่น) ในรูปแบบ yyyy-MM-dd ใช้เทียบกับตัวกรองวันที่
  private dateKey(value: any): string {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ลำดับความสำคัญ: เกิน 24 ชม. -> รอพิจารณา -> อนุมัติแล้ว -> อื่น ๆ
  private priority(b: any): number {
    if (this.isOverdue(b)) return 0;
    if (b.booking_status === 'pending') return 1;
    if (b.booking_status === 'approved') return 2;
    return 3;
  }

  private matchStatus(b: any, tab: string): boolean {
    if (!tab) return true;
    if (tab === 'other') {
      return b.booking_status !== 'pending' && b.booking_status !== 'approved';
    }
    return b.booking_status === tab;
  }

  // รายการที่ผ่านตัวกรองทั้งหมด (เรียงรายการที่ต้องลงมือขึ้นก่อน แล้วเรียงตามวันที่จองใหม่ -> เก่า)
  get filteredBookings() {
    const list = this.scoped.filter((b) => {
      const matchSearch =
        !this.searchText ||
        `${b.name} ${b.lastname}`
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        b.phone?.includes(this.searchText);
      const matchStatus = this.matchStatus(b, this.filterStatus);
      const matchDate =
        !this.filterDate ||
        this.dateKey(b.booking_datetime) === this.filterDate;
      return matchSearch && matchStatus && matchDate;
    });

    return list.sort((a, b) => {
      const pa = this.priority(a);
      const pb = this.priority(b);
      if (pa !== pb) return pa - pb;
      return (
        new Date(b.booking_datetime).getTime() -
        new Date(a.booking_datetime).getTime()
      );
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBookings.length / this.pageSize));
  }

  get currentPage(): number {
    return Math.min(this.page, this.totalPages);
  }

  get pagedBookings() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBookings.slice(start, start + this.pageSize);
  }

  get rangeStart(): number {
    return this.filteredBookings.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredBookings.length,
    );
  }

  setStatusTab(tab: string) {
    this.filterStatus = tab;
    this.page = 1;
  }

  clearFilters() {
    this.searchText = '';
    this.filterDate = '';
    this.filterStatus = '';
    this.page = 1;
  }

  get hasActiveFilter(): boolean {
    return !!(this.searchText || this.filterDate || this.filterStatus);
  }

  prevPage() {
    if (this.currentPage > 1) this.page = this.currentPage - 1;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.page = this.currentPage + 1;
  }

  // จำนวนในแต่ละแท็บ (นับตามสถานที่ที่เลือก การค้นหา และวันที่ปัจจุบัน)
  countTab(tab: string): number {
    return this.scoped.filter((b) => {
      const matchSearch =
        !this.searchText ||
        `${b.name} ${b.lastname}`
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        b.phone?.includes(this.searchText);
      const matchDate =
        !this.filterDate ||
        this.dateKey(b.booking_datetime) === this.filterDate;
      return matchSearch && matchDate && this.matchStatus(b, tab);
    }).length;
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

  // ── ดูคำตอบแบบประเมินรายข้อ ──
  openAnswers(b: any) {
    this.answersBooking = b;
    this.answersData = null;
    this.answersLoading = true;
    this.answersOpen = true;

    const token = localStorage.getItem('token');
    this.http
      .get(
        `${environment.apiUrl}/api/health-assessment/by-booking/${b.Booking_ID}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .subscribe({
        next: (res: any) => {
          this.answersData = res;
          this.answersLoading = false;
        },
        error: () => {
          this.answersLoading = false;
          this.answersData = null;
        },
      });
  }

  closeAnswers() {
    this.answersOpen = false;
    this.answersBooking = null;
    this.answersData = null;
  }

  // ข้อที่ตอบไม่เข้าเกณฑ์ (ต้องให้เจ้าหน้าที่พิจารณา)
  get riskyAnswers(): any[] {
    return (this.answersData?.answers || []).filter((a: any) => a.risky);
  }

  // ข้อที่ตอบเข้าเกณฑ์
  get okAnswers(): any[] {
    return (this.answersData?.answers || []).filter((a: any) => !a.risky);
  }

  answerLabel(v: boolean | null): string {
    return v === true ? 'ใช่' : v === false ? 'ไม่ใช่' : '-';
  }

  // อนุมัติ/ปฏิเสธจากในหน้าต่างดูคำตอบ
  decideFromModal(status: string) {
    if (!this.answersBooking) return;
    this.updateStatus(this.answersBooking.Booking_ID, status);
    this.closeAnswers();
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

  // label ของผลคัดกรองสุขภาพที่ผูกมากับ booking นี้
  // ค่าที่เป็นไปได้ตรงกับ ENUM จริงของ Health_Assessment: 'pass' / 'fail' / 'pending'
  getAssessmentLabel(status: string | null): string {
    const map: any = {
      pass: 'ผ่าน',
      pending: 'เหลือง (ต้องพิจารณา)',
      fail: 'ไม่ผ่าน',
    };
    return status ? map[status] || status : 'ไม่มีข้อมูล';
  }

  // ขอบเขต 1.3.2.6: ผลประเมินสีเหลือง (pending) ที่การจองยังรอเจ้าหน้าที่พิจารณาอยู่
  isWaitingReview(b: any): boolean {
    return (
      b.assessment_status === 'pending' &&
      b.booking_status === 'pending' &&
      b.assessment_hours !== null &&
      b.assessment_hours !== undefined
    );
  }

  // จำนวนชั่วโมงที่รอมาแล้ว (ไม่ให้ติดลบ)
  getWaitHours(b: any): number {
    return Math.max(0, Number(b.assessment_hours) || 0);
  }

  // รอเกิน 24 ชั่วโมงแล้วหรือยัง
  isOverdue(b: any): boolean {
    return this.isWaitingReview(b) && this.getWaitHours(b) >= 24;
  }

  // จำนวนเกิน 24 ชม. ในขอบเขตที่เลือกอยู่
  get overdueCount(): number {
    return this.scoped.filter((b) => this.isOverdue(b)).length;
  }

  // ช่วงเวลาที่จอง เช่น "09:30 - 15:00" (ขอบเขต 1.3.2.4)
  // การจองเก่าที่ไม่มี Slot_ID จะใช้เวลาจาก booking_datetime แทน
  getSlotRange(b: any): string {
    if (b.slot_start && b.slot_end) {
      return `${String(b.slot_start).slice(0, 5)} - ${String(b.slot_end).slice(0, 5)}`;
    }
    const d = new Date(b.booking_datetime);
    if (isNaN(d.getTime())) return '-';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  getInitials(name: string, lastname: string): string {
    return `${name?.charAt(0) || ''}${lastname?.charAt(0) || ''}`;
  }

  // ตัวเลขสรุปด้านบน: ถ้าเลือกสถานที่อยู่จะนับเฉพาะสถานที่นั้น
  get totalToday(): number {
    return this.scoped.filter((b) => b.booking_status !== 'cancelled').length;
  }

  get totalApproved(): number {
    return this.scoped.filter((b) => b.booking_status === 'approved').length;
  }

  get totalPending(): number {
    return this.scoped.filter((b) => b.booking_status === 'pending').length;
  }
}
