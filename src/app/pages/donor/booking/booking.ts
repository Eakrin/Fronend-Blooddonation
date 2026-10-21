import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/api';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class BookingComponent implements OnInit {
  // ✅ ตาม ER: ประเภทการบริจาคอยู่ที่ Donation_Record (เจ้าหน้าที่เลือก) จึงตัดขั้น "ประเภท" ออก
  // ขั้นตอน: 1 = สถานที่, 2 = วันที่, 3 = เวลา, 4 = ยืนยัน
  currentStep = 1;
  readonly lastStep = 4;
  locationId: number | null = null;
  selectedSlotId: number | null = null;
  selectedDate = '';
  locations: any[] = [];
  allSlots: any[] = [];
  filteredSlots: any[] = [];
  availableDates: string[] = [];
  isLoading = false;

  checkingAssessment = true;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.checkAssessmentBeforeBooking();
    this.loadLocations();
    this.loadSlots();

    this.route.queryParams.subscribe((params) => {
      const locationId = params['locationId'];
      if (locationId) {
        this.locationId = Number(locationId);
      }
    });
  }

  checkAssessmentBeforeBooking() {
    const token = this.auth.getToken();
    if (!token) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      this.router.navigate(['/login']);
      return;
    }

    this.http
      .get<any>(environment.apiUrl + '/api/health-assessment', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          const ready =
            !!res &&
            res.Booking_ID === null &&
            (res.result_status === 'pass' || res.result_status === 'pending');
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
    this.http.get(environment.apiUrl + '/api/location').subscribe({
      next: (res: any) => {
        this.locations = res;
      },
      error: () => {},
    });
  }

  loadSlots() {
    this.http.get(environment.apiUrl + '/api/donation-day').subscribe({
      next: (res: any) => {
        this.allSlots = res;
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

  canProceed(): boolean {
    if (this.currentStep === 1) return !!this.locationId;
    if (this.currentStep === 2) return !!this.selectedDate;
    if (this.currentStep === 3) return !!this.selectedSlotId;
    return false;
  }

  next() {
    if (this.canProceed() && this.currentStep < this.lastStep)
      this.currentStep++;
  }

  prev() {
    if (this.currentStep > 1) {
      this.currentStep--;
    } else {
      // ขั้นแรก: ย้อนกลับออกจากหน้าจองไปหน้าหลัก
      this.router.navigate(['/home-donor']);
    }
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
