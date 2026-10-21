import { CommonModule, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

// ตรวจว่ารหัสผ่านใหม่กับยืนยันรหัสผ่านตรงกัน
function passwordsMatchValidator(
  group: AbstractControl,
): ValidationErrors | null {
  const newPassword = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { mismatch: true };
}

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.css'],
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  avatarPreview: string | null = null;
  selectedFile: File | null = null;

  isReadOnly = true;
  showPasswordForm = false;
  isSavingPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private location: Location,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initPasswordForm();
    this.loadProfileData();
  }

  // ย้อนกลับหน้าที่เพิ่งมา ถ้าเปิดหน้านี้ตรง ๆ ให้ไปหน้าหลัก
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home-donor']);
    }
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      // อีเมลแก้ไขได้ (ห้ามซ้ำ - ตรวจสอบจริงที่ backend)
      email: [
        { value: '', disabled: true },
        [Validators.required, Validators.email],
      ],
      phone: ['', Validators.required],
      gender: [{ value: '', disabled: true }],
      blood_type: [{ value: '', disabled: true }],
      birthday: [{ value: '', disabled: true }],
      weight: [''],
      height: [''],
    });
  }

  initPasswordForm(): void {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatchValidator },
    );
  }

  loadProfileData(): void {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);

    this.profileForm.patchValue({
      name: user.name ?? '',
      lastname: user.lastname ?? '',
      email: user.email ?? '',
      phone: user.phone ?? user.tel ?? user.phoneNumber ?? '',
      gender: user.gender ?? '',
      blood_type: user.blood_type ?? '',
      birthday: user.birthday?.substring(0, 10) ?? '',
      weight: user.weight ?? '',
      height: user.height ?? '',
    });

    this.avatarPreview = user.profile ?? null;
    this.isReadOnly = true;

    // ล็อก field เหล่านี้ตอนโหลดข้อมูล (รวมอีเมลด้วย)
    this.profileForm.get('gender')?.disable();
    this.profileForm.get('blood_type')?.disable();
    this.profileForm.get('birthday')?.disable();
    this.profileForm.get('email')?.disable();
  }

  onEdit(): void {
    this.isReadOnly = false;
    this.profileForm.get('gender')?.enable();
    this.profileForm.get('blood_type')?.enable();
    this.profileForm.get('birthday')?.enable();
    this.profileForm.get('email')?.enable();
  }

  onCancel(): void {
    this.profileForm.get('gender')?.disable();
    this.profileForm.get('blood_type')?.disable();
    this.profileForm.get('birthday')?.disable();
    this.profileForm.get('email')?.disable();
    this.loadProfileData();
  }

  onFileSelected(event: Event): void {
    if (this.isReadOnly) return;

    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    const token = localStorage.getItem('token');
    const rawValue = this.profileForm.getRawValue();

    // ใช้ FormData เพราะอาจมีไฟล์รูปใหม่แนบไปด้วย
    const formData = new FormData();
    formData.append('name', rawValue.name ?? '');
    formData.append('lastname', rawValue.lastname ?? '');
    formData.append('email', rawValue.email ?? '');
    formData.append('phone', rawValue.phone ?? '');
    formData.append('gender', rawValue.gender ?? '');
    formData.append('blood_type', rawValue.blood_type ?? '');
    formData.append('birthday', rawValue.birthday ?? '');
    formData.append('weight', rawValue.weight ?? '');
    formData.append('height', rawValue.height ?? '');

    // ชื่อฟิลด์ 'profile' ต้องตรงกับ upload.single('profile') ฝั่ง backend
    if (this.selectedFile) {
      formData.append('profile', this.selectedFile);
    }

    // ห้ามใส่ Content-Type เอง ให้เบราว์เซอร์ตั้ง multipart/form-data พร้อม boundary
    this.http
      .put<{ message: string; profile: string | null }>(
        environment.apiUrl + '/api/update-profile/update-profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .subscribe({
        next: (res) => {
          // ใช้ URL รูปจริงจาก Cloudinary ที่ backend ส่งกลับมา
          if (res?.profile) {
            this.avatarPreview = res.profile;
          }
          this.selectedFile = null;

          // อัปเดต localStorage ด้วย
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = {
            ...currentUser,
            ...rawValue,
            profile: this.avatarPreview,
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));

          alert('บันทึกข้อมูลสำเร็จ');

          this.profileForm.get('gender')?.disable();
          this.profileForm.get('blood_type')?.disable();
          this.profileForm.get('birthday')?.disable();
          this.profileForm.get('email')?.disable();
          this.isReadOnly = true;
        },
        error: (err) => {
          // backend ส่งข้อความกลับมาเมื่ออีเมล/เบอร์โทรซ้ำ
          alert(err.error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        },
      });
  }

  // ── เปลี่ยนรหัสผ่าน ──────────────────────────────
  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    if (this.showPasswordForm) {
      this.passwordForm.reset();
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      if (this.passwordForm.errors?.['mismatch']) {
        alert('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      } else {
        alert('กรุณากรอกข้อมูลรหัสผ่านให้ครบถ้วน (อย่างน้อย 8 ตัวอักษร)');
      }
      return;
    }

    const token = localStorage.getItem('token');
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.isSavingPassword = true;

    this.http
      .put(
        environment.apiUrl + '/api/update-profile/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .subscribe({
        next: () => {
          this.isSavingPassword = false;
          alert('เปลี่ยนรหัสผ่านสำเร็จ');
          this.showPasswordForm = false;
          this.passwordForm.reset();
        },
        error: (err) => {
          this.isSavingPassword = false;
          alert(err.error?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่');
        },
      });
  }
}
