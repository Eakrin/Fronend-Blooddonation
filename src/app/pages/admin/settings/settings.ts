import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  locations: any[] = [];
  selectedId: number | null = null;

  name = '';
  phone = '';
  email = '';
  address = '';
  type = '';

  // เวลาทำการ: ER ไม่มีที่เก็บ (เวลารับบริจาคกำหนดที่วันรับบริจาค/ช่วงเวลา) จึงแสดงอย่างเดียว
  weekdayStart = '08:30';
  weekdayEnd = '16:30';

  errorMsg = '';
  isLoading = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.load();
  }

  private authHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  load() {
    this.http
      .get<
        any[]
      >(environment.apiUrl + '/api/admin/locations', this.authHeaders())
      .subscribe({
        next: (res) => {
          this.locations = res;
          if (res.length) {
            const keep = res.find((l) => l.Location_ID === this.selectedId);
            this.select((keep || res[0]).Location_ID);
          }
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'โหลดข้อมูลไม่สำเร็จ';
        },
      });
  }

  select(id: any) {
    this.selectedId = Number(id);
    const l = this.locations.find((x) => x.Location_ID === this.selectedId);
    if (!l) return;
    this.name = l.name || '';
    this.phone = l.phone || '';
    this.email = l.email || '';
    this.address = l.address || '';
    this.type = l.type || '';
    this.errorMsg = '';
  }

  cancel() {
    if (this.selectedId !== null) this.select(this.selectedId);
  }

  save() {
    this.errorMsg = '';
    if (!this.name.trim()) {
      this.errorMsg = 'กรุณากรอกชื่อหน่วยงาน';
      return;
    }
    this.isLoading = true;
    this.http
      .put(
        `${environment.apiUrl}/api/admin/locations/${this.selectedId}`,
        {
          name: this.name,
          phone: this.phone,
          email: this.email,
          address: this.address,
          type: this.type,
        },
        this.authHeaders(),
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          alert('บันทึกสำเร็จ');
          this.load();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'เกิดข้อผิดพลาด';
        },
      });
  }
}
