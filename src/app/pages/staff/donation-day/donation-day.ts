import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-donation-day',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, DatePipe],
  templateUrl: './donation-day.html',
  styleUrl: './donation-day.css',
})
export class DonationDay implements OnInit {
  slots: any[] = [];
  locations: any[] = [];
  isModalOpen = false;
  isLoading = false;
  errorMsg = '';
  editingId: number | null = null;

  donationDate = '';
  locationId: number | null = null;
  startTime = '';
  endTime = '';
  maxQuota: number | null = null;
  timeSlots: string[] = [];
  dateOptions: string[] = []; // ✅ เพิ่มตรงนี้ ใต้ timeSlots

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSlots();
    this.loadLocations();
    this.generateTimeSlots();
    this.generateDateOptions(); // ✅ เพิ่ม
  }

  generateTimeSlots() {
    for (let h = 6; h <= 20; h++) {
      for (let m of [0, 30]) {
        const hour = h.toString().padStart(2, '0');
        const min = m.toString().padStart(2, '0');
        this.timeSlots.push(`${hour}:${min}`);
      }
    }
  }

  generateDateOptions() {
    // ✅ เพิ่ม method นี้ ใต้ generateTimeSlots()
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      this.dateOptions.push(`${yyyy}-${mm}-${dd}`);
    }
  }

  loadLocations() {
    const token = localStorage.getItem('token');
    this.http
      .get('http://localhost:3000/api/location', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res: any) => {
          this.locations = res;
        },
        error: () => {},
      });
  }

  loadSlots() {
    const token = localStorage.getItem('token');
    this.http
      .get('http://localhost:3000/api/donation-day', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res: any) => {
          this.slots = res;
        },
        error: () => {},
      });
  }

  openModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  openEditModal(slot: any) {
    this.editingId = slot.Slot_ID;
    this.donationDate = slot.Donation_date?.split('T')[0];
    this.locationId = slot.Location_ID;
    this.startTime = slot.Start_time?.slice(0, 5);
    this.endTime = slot.End_time?.slice(0, 5);
    this.maxQuota = slot.max_quota;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.donationDate = '';
    this.locationId = null;
    this.startTime = '';
    this.endTime = '';
    this.maxQuota = null;
    this.errorMsg = '';
    this.editingId = null;
    this.isLoading = false;
  }

  saveSlot() {
    if (
      !this.donationDate ||
      !this.locationId ||
      !this.startTime ||
      !this.endTime ||
      !this.maxQuota
    ) {
      this.errorMsg = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const token = localStorage.getItem('token');
    const data = {
      Donation_date: this.donationDate,
      Location_ID: this.locationId,
      Start_time: this.startTime,
      End_time: this.endTime,
      max_quota: this.maxQuota,
    };

    const req = this.editingId
      ? this.http.put(
          `http://localhost:3000/api/donation-day/${this.editingId}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } },
        )
      : this.http.post('http://localhost:3000/api/donation-day', data, {
          headers: { Authorization: `Bearer ${token}` },
        });

    req.subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.loadSlots();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'เกิดข้อผิดพลาด';
      },
    });
  }

  deleteSlot(slotId: number) {
    if (!confirm('ต้องการลบรายการนี้ใช่ไหม?')) return;
    const token = localStorage.getItem('token');
    this.http
      .delete(`http://localhost:3000/api/donation-day/${slotId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => this.loadSlots(),
        error: () => {},
      });
  }
}
