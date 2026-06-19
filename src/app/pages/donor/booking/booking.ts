import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.loadSlots();
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
    this.auth.createBooking({ booking_datetime }, token).subscribe({
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
