import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-location-staff',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './location-staff.html',
  styleUrl: './location-staff.css',
})
export class LocationStaff implements OnInit {
  locations: any[] = [];
  isModalOpen = false;
  isLoading = false;
  errorMsg = '';
  editingId: number | null = null;

  form = {
    name: '',
    address: '',
    phone: '',
    email: '',
    type: '',
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadLocations();
  }

  get hospitalCount() {
    return this.locations.filter((l) => l.type === 'hospital').length;
  }
  get mobileCount() {
    return this.locations.filter((l) => l.type === 'mobile').length;
  }

  getTypeName(type: string): string {
    const map: any = {
      hospital: 'โรงพยาบาล',
      hall: 'หอประชุม',
      mobile: 'หน่วยเคลื่อนที่',
      other: 'อื่นๆ',
    };
    return map[type] || '-';
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

  openModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  openEditModal(loc: any) {
    this.editingId = loc.Location_ID;
    this.form = {
      name: loc.name,
      address: loc.address || '',
      phone: loc.phone || '',
      email: loc.email || '',
      type: loc.type || '',
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.editingId = null;
    this.errorMsg = '';
    this.isLoading = false;
    this.form = { name: '', address: '', phone: '', email: '', type: '' };
  }

  save() {
    if (!this.form.name) {
      this.errorMsg = 'กรุณาระบุชื่อสถานที่';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    const token = localStorage.getItem('token');

    const req = this.editingId
      ? this.http.put(
          `http://localhost:3000/api/location/${this.editingId}`,
          this.form,
          { headers: { Authorization: `Bearer ${token}` } },
        )
      : this.http.post('http://localhost:3000/api/location', this.form, {
          headers: { Authorization: `Bearer ${token}` },
        });

    req.subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.loadLocations();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'เกิดข้อผิดพลาด';
      },
    });
  }

  deleteLocation(id: number) {
    if (!confirm('ต้องการลบสถานที่นี้ใช่ไหม?')) return;
    const token = localStorage.getItem('token');
    this.http
      .delete(`http://localhost:3000/api/location/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => this.loadLocations(),
        error: () => {},
      });
  }
}
