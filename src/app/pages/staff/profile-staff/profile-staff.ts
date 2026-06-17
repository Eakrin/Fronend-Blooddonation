import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-staff',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './profile-staff.html',
  styleUrl: './profile-staff.css',
})
export class ProfileStaff implements OnInit {
  name = '';
  email = '';
  phone = '';
  newPassword = '';
  confirmPassword = '';
  avatarPreview: string | null = null;
  isLoading = false;
  errorMsg = '';
  isReadOnly = true; // ✅ เริ่มต้นโหมดดูข้อมูล

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.name = parsed.name + ' ' + (parsed.lastname || '');
      this.email = parsed.email || '';
      this.phone = parsed.phone || '';
    }
  }

  startEdit() {
    this.isReadOnly = false;
  }

  cancel() {
    this.isReadOnly = true;
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMsg = '';
    // คืนค่าเดิม
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.name = parsed.name + ' ' + (parsed.lastname || '');
      this.phone = parsed.phone || '';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.avatarPreview = null;
  }

  save() {
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'รหัสผ่านไม่ตรงกัน';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const nameParts = this.name.trim().split(' ');
    const data: any = {
      name: nameParts[0] || '',
      lastname: nameParts.slice(1).join(' ') || '',
      phone: this.phone,
      status: user.status || 'active',
      email: this.email,
    };

    if (this.newPassword) data.password = this.newPassword;

    this.http
      .put(`http://localhost:3000/api/admin/staff/${user.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.isReadOnly = true;
          this.newPassword = '';
          this.confirmPassword = '';
          const updated = {
            ...user,
            name: nameParts[0],
            lastname: nameParts.slice(1).join(' '),
            phone: this.phone,
          };
          localStorage.setItem('user', JSON.stringify(updated));
          alert('บันทึกสำเร็จ');
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'เกิดข้อผิดพลาด';
        },
      });
  }
}
