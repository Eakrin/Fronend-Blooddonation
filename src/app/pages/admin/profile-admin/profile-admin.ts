import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile-admin',
  imports: [FormsModule, NgIf],
  templateUrl: './profile-admin.html',
  styleUrl: './profile-admin.css',
})
export class profileAdmin implements OnInit {
  name = '';
  email = '';
  phone = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  errorMsg = '';
  isLoading = false;

  // เก็บค่าล่าสุดจากเซิร์ฟเวอร์ ไว้คืนค่าเมื่อกดยกเลิก
  private saved = { email: '', phone: '' };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProfile();
  }

  private authHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  loadProfile() {
    this.http
      .get<any>(environment.apiUrl + '/api/admin/profile', this.authHeaders())
      .subscribe({
        next: (res) => {
          this.name = res.name || '';
          this.email = res.email || '';
          this.phone = res.phone || '';
          this.saved = { email: this.email, phone: this.phone };
        },
        error: (err) => {
          this.errorMsg = err.error?.message || 'โหลดข้อมูลไม่สำเร็จ';
        },
      });
  }

  cancel() {
    this.email = this.saved.email;
    this.phone = this.saved.phone;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMsg = '';
  }

  save() {
    this.errorMsg = '';

    if (!this.email.trim()) {
      this.errorMsg = 'กรุณากรอกอีเมล';
      return;
    }

    if (this.newPassword) {
      if (!this.currentPassword) {
        this.errorMsg = 'กรุณากรอกรหัสผ่านปัจจุบันเพื่อเปลี่ยนรหัสผ่าน';
        return;
      }
      if (this.newPassword.length < 8) {
        this.errorMsg = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.errorMsg = 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน';
        return;
      }
    }

    const body: any = {
      email: this.email.trim(),
      phone: this.phone.trim(),
    };
    if (this.newPassword) {
      body.currentPassword = this.currentPassword;
      body.newPassword = this.newPassword;
    }

    this.isLoading = true;
    this.http
      .put(environment.apiUrl + '/api/admin/profile', body, this.authHeaders())
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.saved = { email: body.email, phone: body.phone };
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';

          // อัปเดตข้อมูลที่เก็บในเบราว์เซอร์ให้ตรงกับที่บันทึกใหม่
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem(
            'user',
            JSON.stringify({ ...user, email: body.email, phone: body.phone }),
          );

          alert('บันทึกสำเร็จ');
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'เกิดข้อผิดพลาด';
        },
      });
  }
}
