import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../services/api';
import { signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleProvider } from '../../../firebase-config';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, NgIf],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name = '';
  lastname = '';
  email = '';
  password = '';
  phone = '';
  blood_type = '';
  birthday = '';
  gender = '';
  weight = '';
  height = '';

  isDarkMode = false;
  isGoogleLoading = false;

  selectedFile: File | null = null;
  avatarPreview: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService,
  ) {}

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  onFileSelected(event: Event): void {
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

  // ถ้าปีเป็น พ.ศ. (> 2400) แปลงเป็น ค.ศ. ก่อนส่ง
  private normalizeBirthday(value: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!m) return value;
    let year = Number(m[1]);
    if (year > 2400) year -= 543;
    return `${year}-${m[2]}-${m[3]}`;
  }

  private calcAge(isoDate: string): number {
    const b = new Date(isoDate);
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const hadBirthday =
      today.getMonth() > b.getMonth() ||
      (today.getMonth() === b.getMonth() && today.getDate() >= b.getDate());
    if (!hadBirthday) age--;
    return age;
  }

  // คืนข้อความ error ถ้าไม่ผ่าน, คืน null ถ้าผ่าน
  private validate(birthdayIso: string): string | null {
    if (!this.name.trim() || !this.lastname.trim()) {
      return 'กรุณากรอกชื่อและนามสกุล';
    }
    if (!this.blood_type) return 'กรุณาเลือกหมู่โลหิต';

    const phone = this.phone.replace(/[\s-]/g, '');
    if (!/^0\d{9}$/.test(phone)) {
      return 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก ขึ้นต้นด้วย 0';
    }

    const w = Number(this.weight);
    if (!this.weight || isNaN(w) || w < 30 || w > 200) {
      return 'น้ำหนักต้องอยู่ระหว่าง 30–200 กก.';
    }
    const h = Number(this.height);
    if (!this.height || isNaN(h) || h < 100 || h > 250) {
      return 'ส่วนสูงต้องอยู่ระหว่าง 100–250 ซม.';
    }

    if (!birthdayIso) return 'กรุณาเลือกวันเกิด';
    const age = this.calcAge(birthdayIso);
    if (isNaN(age) || age < 17 || age > 70) {
      return 'ผู้บริจาคต้องมีอายุ 17–70 ปี (ตรวจสอบวันเกิดอีกครั้ง)';
    }

    if (!this.gender) return 'กรุณาเลือกเพศ';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim())) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    if (this.password.length < 8) {
      return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    }
    return null;
  }

  register() {
    const birthdayIso = this.normalizeBirthday(this.birthday);

    const error = this.validate(birthdayIso);
    if (error) {
      alert(error);
      return;
    }

    const formData = new FormData();
    formData.append('name', this.name.trim());
    formData.append('lastname', this.lastname.trim());
    formData.append('email', this.email.trim());
    formData.append('password', this.password);
    formData.append('phone', this.phone.replace(/[\s-]/g, ''));
    formData.append('blood_type', this.blood_type);
    formData.append('birthday', birthdayIso);
    formData.append('gender', this.gender);
    formData.append('weight', this.weight);
    formData.append('height', this.height);

    if (this.selectedFile) {
      formData.append('profile', this.selectedFile);
    }

    // ห้ามใส่ Content-Type เอง ให้เบราว์เซอร์ตั้ง multipart/form-data เอง
    this.http
      .post(environment.apiUrl + '/api/auth/register', formData)
      .subscribe({
        next: () => {
          alert('สมัครสมาชิกสำเร็จ!');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert(err.error?.message || 'สมัครสมาชิกไม่สำเร็จ');
        },
      });
  }

  async registerWithGoogle() {
    if (this.isGoogleLoading) return;
    this.isGoogleLoading = true;

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      this.http
        .post(environment.apiUrl + '/api/auth/google', { idToken })
        .subscribe({
          next: (res: any) => {
            this.isGoogleLoading = false;

            this.auth.saveToken(res.token);
            this.auth.saveRole(res.role);

            const backendUser = res.user || {};
            const userPayload = {
              id: backendUser.id,
              name: backendUser.name || '',
              lastname: backendUser.lastname || '',
              email: backendUser.email || '',
              phone: backendUser.phone || '',
              gender: backendUser.gender || '',
              blood_type: backendUser.blood_type || '',
              birthday: backendUser.birthday || '',
              weight: backendUser.weight ?? '',
              height: backendUser.height ?? '',
              profile: backendUser.profile || null,
            };
            localStorage.setItem('user', JSON.stringify(userPayload));

            if (!backendUser.phone || !backendUser.blood_type) {
              alert(
                'เข้าสู่ระบบสำเร็จ! กรุณากรอกข้อมูลส่วนตัวเพิ่มเติมให้ครบถ้วน',
              );
              this.router.navigate(['/edit-profile']);
            } else {
              this.router.navigate(['/home-donor']);
            }
          },
          error: (err) => {
            this.isGoogleLoading = false;
            alert(err.error?.message || 'สมัครสมาชิกด้วย Google ไม่สำเร็จ');
          },
        });
    } catch (err: any) {
      this.isGoogleLoading = false;
      if (err?.code !== 'auth/popup-closed-by-user') {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google');
      }
    }
  }
}
