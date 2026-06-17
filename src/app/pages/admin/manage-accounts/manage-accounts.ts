import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manage-accounts',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: './manage-accounts.html',
  styleUrl: './manage-accounts.css',
})
export class ManageAccounts implements OnInit {
  get activeCount() {
    return this.staffList.filter((s) => s.status === 'active').length;
  }

  get suspendedCount() {
    return this.staffList.filter((s) => s.status === 'suspended').length;
  }
  // ── Create Modal ──
  isModalOpen = false;
  name = '';
  lastname = '';
  email = '';
  password = '';
  phone = '';
  role = '';
  isLoading = false;
  errorMsg = '';

  // ── Edit Modal ──
  isEditModalOpen = false;
  editStaff: any = null;
  editName = '';
  editLastname = '';
  editEmail = '';
  editPhone = '';
  editIsSuspended = false;
  editLoading = false;
  editErrorMsg = '';
  editPassword = ''; // ✅ เพิ่ม

  // ── Staff List ──
  staffList: any[] = [];

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.loadStaff();
  }

  loadStaff() {
    const token = localStorage.getItem('token');
    this.http
      .get('http://localhost:3000/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res: any) => {
          this.staffList = res;
        },
        error: () => {},
      });
  }

  // ── Create ──
  openModal() {
    this.isModalOpen = true;
    this.resetForm();
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.name = '';
    this.lastname = '';
    this.email = '';
    this.password = '';
    this.phone = '';
    this.role = '';
    this.errorMsg = '';
    this.isLoading = false;
  }

  createStaff() {
    if (
      !this.name ||
      !this.lastname ||
      !this.email ||
      !this.password ||
      !this.role
    ) {
      this.errorMsg = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const token = localStorage.getItem('token');
    const data = {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      phone: this.phone,
      role: this.role,
    };

    this.http
      .post('http://localhost:3000/api/admin/create-staff', data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          alert('สร้างบัญชีเจ้าหน้าที่สำเร็จ');
          this.closeModal();
          this.loadStaff();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMsg = err.error?.message || 'เกิดข้อผิดพลาด';
        },
      });
  }

  // ── Edit ──
  openEditModal(staff: any) {
    this.editStaff = staff;
    this.editName = staff.name;
    this.editLastname = staff.lastname;
    this.editEmail = staff.email;
    this.editPhone = staff.phone || '';
    this.editIsSuspended = staff.status === 'suspended';
    this.editPassword = ''; // ✅ เพิ่ม
    this.editErrorMsg = '';
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editStaff = null;
    this.editErrorMsg = '';
    this.editLoading = false;
    this.editPassword = ''; // ✅ เพิ่ม
  }

  saveEdit() {
    if (!this.editName || !this.editLastname || !this.editEmail) {
      this.editErrorMsg = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    this.editLoading = true;
    this.editErrorMsg = '';

    const token = localStorage.getItem('token');
    const data: any = {
      // ✅ เปลี่ยนเป็น any
      name: this.editName,
      lastname: this.editLastname,
      email: this.editEmail,
      phone: this.editPhone,
      status: this.editIsSuspended ? 'suspended' : 'active',
    };

    if (this.editPassword) {
      data.password = this.editPassword;
    }

    this.http
      .put(
        `http://localhost:3000/api/admin/staff/${this.editStaff.Staff_ID}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .subscribe({
        next: () => {
          this.editLoading = false;
          alert('บันทึกการเปลี่ยนแปลงสำเร็จ');
          this.closeEditModal();
          this.loadStaff();
        },
        error: (err) => {
          this.editLoading = false;
          this.editErrorMsg = err.error?.message || 'เกิดข้อผิดพลาด';
        },
      });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}
