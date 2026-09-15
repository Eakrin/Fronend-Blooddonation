import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/api';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class BookingComponent implements OnInit {
  currentStep = 1;
  donationType = '';
  locationId: number | null = null;
  selectedSlotId: number | null = null;
  selectedDate = '';
  locations: any[] = [];
  allSlots: any[] = [];
  filteredSlots: any[] = [];
  availableDates: string[] = [];
  isLoading = false;

  // ✅ ใหม่: เช็คก่อนว่าพร้อมให้กรอกฟอร์มจองไหม (มีผลประเมินสุขภาพที่ยังไม่ถูกใช้และผ่านเกณฑ์)
  // ป้องกันไม่ให้ผู้ใช้กรอกฟอร์มจนครบ 5 ขั้นตอนแล้วมาเจอ error ตอนกดยืนยันตอนจบ
  checkingAssessment = true;

  donationTypes = [
    {
      value: 'whole',
      label: 'บริจาคโลหิตรวม',
      icon: '🩸',
      desc: 'บริจาคเลือดทั้งหมด ใช้เวลาประมาณ 10-15 นาที',
    },
    {
      value: 'plasma',
      label: 'บริจาคพลาสม่า',
      icon: '💧',
      desc: 'บริจาคน้ำเลือด เหมาะสำหรับผู้บริจาคบ่อย',
    },
    {
      value: 'platelets',
      label: 'บริจาคเกล็ดโลหิต',
      icon: '🧬',
      desc: 'บริจาคเกล็ดเลือด ช่วยผู้ป่วยมะเร็ง',
    },
  ];

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // ✅ ใหม่: เช็คผลประเมินสุขภาพก่อนเป็นอันดับแรก ถ้ายังไม่พร้อมจะเด้งไปหน้าประเมินทันที
    this.checkAssessmentBeforeBooking();
    this.loadLocations();
    this.loadSlots();

    // ✅ ใหม่: รับ locationId ที่ส่งมาจากหน้ารายชื่อสถานที่ (ตอนกด "จองคิวบริจาค"
    // ที่การ์ดสถานที่ใดสถานที่หนึ่ง) มา pre-select ให้เลย ไม่ต้องเลือกซ้ำใน step 2
    // หมายเหตุ: แค่เก็บค่า locationId ไว้ก่อน ส่วนการคำนวณ availableDates (onLocationChange)
    // จะเรียกอีกทีหลัง loadSlots() โหลดข้อมูล allSlots เสร็จ (ดูใน loadSlots ด้านล่าง)
    this.route.queryParams.subscribe((params) => {
      const locationId = params['locationId'];
      if (locationId) {
        this.locationId = Number(locationId);
      }
    });
  }

  // ✅ ใหม่: ต้องมี Health_Assessment ล่าสุดที่ (1) result_status = 'pass' และ
  // (2) Booking_ID ยังเป็น NULL (ยังไม่เคยถูกใช้ผูกกับการจองอื่นมาก่อน) เท่านั้น
  // ถึงจะถือว่า "พร้อมจอง" ถ้าไม่เข้าเงื่อนไขนี้ (ไม่เคยประเมิน / ประเมินไปแล้วแต่ใช้ไปกับ
  // booking เก่า / fail / pending) ให้เด้งไปทำแบบประเมินใหม่ก่อน
  checkAssessmentBeforeBooking() {
    const token = this.auth.getToken();
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      this.router.navigate(['/login']);
      return;
    }

    this.http
      .get<any>('http://localhost:3000/api/health-assessment', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          const ready =
            !!res && res.Booking_ID === null && res.result_status === 'pass';
          if (!ready) {
            alert('กรุณาทำแบบประเมินสุขภาพก่อนทำการจอง');
            this.router.navigate(['/assessment-quiz']);
            return;
          }
          this.checkingAssessment = false;
        },
        error: () => {
          alert('กรุณาทำแบบประเมินสุขภาพก่อนทำการจอง');
          this.router.navigate(['/assessment-quiz']);
        },
      });
  }

  loadLocations() {
    this.http.get('http://localhost:3000/api/location').subscribe({
      next: (res: any) => {
        this.locations = res;
      },
      error: () => {},
    });
  }

  loadSlots() {
    this.http.get('http://localhost:3000/api/donation-day').subscribe({
      next: (res: any) => {
        this.allSlots = res;
        // ✅ ใหม่: ถ้ามี locationId มาจาก query param อยู่แล้ว (มาจากหน้ารายชื่อสถานที่)
        // ให้คำนวณวันที่ว่างของสถานที่นั้นทันทีที่ allSlots โหลดเสร็จ
        if (this.locationId) {
          this.onLocationChange();
        }
      },
      error: () => {},
    });
  }

  onLocationChange() {
    this.selectedDate = '';
    this.selectedSlotId = null;
    this.filteredSlots = [];
    if (this.locationId) {
      const slots = this.allSlots.filter(
        (s) => s.Location_ID === this.locationId,
      );
      const dates = [
        ...new Set(slots.map((s) => s.Donation_date?.split('T')[0])),
      ];
      this.availableDates = dates as string[];
    }
  }

  onDateChange() {
    this.selectedSlotId = null;
    if (this.locationId && this.selectedDate) {
      this.filteredSlots = this.allSlots.filter(
        (s) =>
          s.Location_ID === this.locationId &&
          s.Donation_date?.split('T')[0] === this.selectedDate,
      );
    }
  }

  getQuotaPercent(slot: any): number {
    if (!slot.max_quota) return 0;
    return Math.round(((slot.booked || 0) / slot.max_quota) * 100);
  }

  isFull(slot: any): boolean {
    return (slot.booked || 0) >= slot.max_quota;
  }

  isAllFull(): boolean {
    return (
      this.filteredSlots.length > 0 &&
      this.filteredSlots.every((s) => this.isFull(s))
    );
  }

  getLocationName(): string {
    const loc = this.locations.find((l) => l.Location_ID === this.locationId);
    return loc ? loc.name : '-';
  }

  getSlotLabel(): string {
    const slot = this.filteredSlots.find(
      (s) => s.Slot_ID === this.selectedSlotId,
    );
    return slot
      ? `${slot.Start_time?.slice(0, 5)} - ${slot.End_time?.slice(0, 5)}`
      : '-';
  }

  getDonationTypeLabel(): string {
    const t = this.donationTypes.find((t) => t.value === this.donationType);
    return t ? t.label : '-';
  }

  canProceed(): boolean {
    if (this.currentStep === 1) return !!this.donationType;
    if (this.currentStep === 2) return !!this.locationId;
    if (this.currentStep === 3) return !!this.selectedDate;
    if (this.currentStep === 4) return !!this.selectedSlotId;
    return false;
  }

  next() {
    if (this.canProceed() && this.currentStep < 5) this.currentStep++;
  }

  prev() {
    if (this.currentStep > 1) this.currentStep--;
  }

  confirmBooking() {
    const token = this.auth.getToken();
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    const slot = this.filteredSlots.find(
      (s) => s.Slot_ID === this.selectedSlotId,
    );
    if (!slot) return;

    const booking_datetime = `${this.selectedDate} ${slot.Start_time}`;

    this.isLoading = true;
    // ✅ ใหม่: ส่ง Slot_ID ไปด้วย เพื่อให้ backend บันทึกผูก booking กับสถานที่/ช่วงเวลาจริง
    // (ก่อนหน้านี้ส่งแค่ booking_datetime ทำให้ระบบไม่รู้ว่า booking นี้เป็นของสถานที่ไหน)
    this.auth
      .createBooking({ booking_datetime, Slot_ID: this.selectedSlotId }, token)
      .subscribe({
        next: () => {
          this.isLoading = false;
          alert('จองสำเร็จ');
          this.router.navigate(['/home-donor']);
        },
        error: (err) => {
          this.isLoading = false;
          alert(err.error?.message || 'เกิดข้อผิดพลาด');
        },
      });
  }
}
