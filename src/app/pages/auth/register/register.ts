import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/api';
import { signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleProvider } from '../../../firebase-config';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
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

  // สถานะโหมดสายตา (เริ่มต้นสว่าง = false)
  isDarkMode = false;
  isGoogleLoading = false;

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

  register() {
    const data = {
      name: this.name,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      phone: this.phone,
      blood_type: this.blood_type,
      birthday: this.birthday,
      gender: this.gender,
      weight: this.weight,
      height: this.height,
    };

    this.http.post('http://localhost:3000/api/auth/register', data).subscribe({
      next: (res: any) => {
        alert('สมัครสมาชิกสำเร็จ!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(err.error.message);
      },
    });
  }

  // ✅ ใหม่: สมัครสมาชิก/เข้าสู่ระบบอัตโนมัติด้วย Google
  // ถ้ายังไม่มีบัญชีในระบบ backend จะสร้างบัญชีผู้บริจาคใหม่ให้อัตโนมัติแล้วเข้าสู่ระบบทันที
  async registerWithGoogle() {
    if (this.isGoogleLoading) return;
    this.isGoogleLoading = true;

    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await result.user.getIdToken();

      this.http
        .post('http://localhost:3000/api/auth/google', { idToken })
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

            // ถ้าเพิ่งสร้างบัญชีใหม่จาก Google ข้อมูลเบอร์โทร/หมู่เลือด ฯลฯ จะยังว่างอยู่
            // พาไปหน้าแก้ไขโปรไฟล์ให้กรอกข้อมูลที่เหลือให้ครบก่อน
            if (!backendUser.phone || !backendUser.blood_type) {
              alert('เข้าสู่ระบบสำเร็จ! กรุณากรอกข้อมูลส่วนตัวเพิ่มเติมให้ครบถ้วน');
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