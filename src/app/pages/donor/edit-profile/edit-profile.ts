import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.css'],
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;

  avatarPreview: string | null = null;
  selectedFile: File | null = null;

  isReadOnly = true;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProfileData();
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
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

    // ล็อก field เหล่านี้ตอนโหลดข้อมูล
    this.profileForm.get('gender')?.disable();
    this.profileForm.get('blood_type')?.disable();
    this.profileForm.get('birthday')?.disable();
  }

  onEdit(): void {
    this.isReadOnly = false;
    this.profileForm.get('gender')?.enable();
    this.profileForm.get('blood_type')?.enable();
    this.profileForm.get('birthday')?.enable();
  }

  onCancel(): void {
    this.profileForm.get('gender')?.disable();
    this.profileForm.get('blood_type')?.disable();
    this.profileForm.get('birthday')?.disable();
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

    this.http
      .put(
        'http://localhost:3000/api/update-profile/update-profile',
        rawValue,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      .subscribe({
        next: () => {
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
          this.isReadOnly = true;
        },
        error: (err) => {
          alert(err.error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        },
      });
  }
}
