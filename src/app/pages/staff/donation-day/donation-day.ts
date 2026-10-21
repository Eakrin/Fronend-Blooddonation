import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

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
  today = new Date().toISOString().split('T')[0];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadSlots();
    this.loadLocations();
  }

  private authHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  loadLocations() {
    this.http
      .get(environment.apiUrl + '/api/location', this.authHeaders())
      .subscribe({
        next: (res: any) => {
          this.locations = res;
        },
        error: () => {},
      });
  }

  loadSlots() {
    this.http
      .get(environment.apiUrl + '/api/donation-day', this.authHeaders())
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

  // แปลงที่พิมพ์ เช่น 930, 9:30, 0930 ให้เป็น 09:30 ถ้าไม่ใช่เวลาที่ถูกต้องจะคืนค่าว่าง
  normalizeTime(value: string): string {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length < 3 || digits.length > 4) return '';
    const h = Number(digits.slice(0, digits.length - 2));
    const m = Number(digits.slice(-2));
    if (h > 23 || m > 59) return '';
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  saveSlot() {
    this.startTime = this.normalizeTime(this.startTime);
    this.endTime = this.normalizeTime(this.endTime);

    // ปฏิทินของเบราว์เซอร์ภาษาไทยอาจให้ปี พ.ศ. ให้แปลงกลับเป็น ค.ศ.
    if (this.donationDate) {
      const [y, m, d] = this.donationDate.split('-');
      if (Number(y) > 2400) {
        this.donationDate = `${Number(y) - 543}-${m}-${d}`;
      }
    }

    if (
      !this.donationDate ||
      !this.locationId ||
      !this.startTime ||
      !this.endTime ||
      !this.maxQuota
    ) {
      this.errorMsg =
        'กรุณากรอกข้อมูลให้ครบถ้วน (เวลาต้องเป็นรูปแบบ เช่น 09:30)';
      return;
    }

    // เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม
    if (this.endTime <= this.startTime) {
      this.errorMsg = 'เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const data = {
      Donation_date: this.donationDate,
      Location_ID: this.locationId,
      Start_time: this.startTime,
      End_time: this.endTime,
      max_quota: this.maxQuota,
    };

    const req = this.editingId
      ? this.http.put(
          `${environment.apiUrl}/api/donation-day/${this.editingId}`,
          data,
          this.authHeaders(),
        )
      : this.http.post(
          environment.apiUrl + '/api/donation-day',
          data,
          this.authHeaders(),
        );

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
    this.http
      .delete(
        `${environment.apiUrl}/api/donation-day/${slotId}`,
        this.authHeaders(),
      )
      .subscribe({
        next: () => this.loadSlots(),
        error: (err) => {
          alert(
            err.error?.message || 'ลบไม่สำเร็จ อาจมีผู้จองช่วงเวลานี้อยู่แล้ว',
          );
        },
      });
  }
}
