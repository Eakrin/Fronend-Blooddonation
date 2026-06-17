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
  isModalOpen = false;
  isLoading = false;
  errorMsg = '';
  editingId: number | null = null;

  locationName = '';
  donationDate = '';
  startTime = '';
  endTime = '';
  maxQuota: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSlots();
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
    this.editingId = slot.DonationD_ID;
    this.locationName = slot.location_name;
    this.donationDate = slot.Donation_date?.split('T')[0];
    this.startTime = slot.Start_time;
    this.endTime = slot.End_time;
    this.maxQuota = slot.max_quota;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.locationName = '';
    this.donationDate = '';
    this.startTime = '';
    this.endTime = '';
    this.maxQuota = null;
    this.errorMsg = '';
    this.editingId = null;
    this.isLoading = false;
  }

  saveSlot() {
    if (
      !this.locationName ||
      !this.donationDate ||
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
      location_name: this.locationName,
      Donation_date: this.donationDate,
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

  deleteSlot(id: number) {
    if (!confirm('ต้องการลบรายการนี้ใช่ไหม?')) return;
    const token = localStorage.getItem('token');
    this.http
      .delete(`http://localhost:3000/api/donation-day/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => this.loadSlots(),
        error: () => {},
      });
  }
}
