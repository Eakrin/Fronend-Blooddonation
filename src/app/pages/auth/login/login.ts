import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/api';
import { signInWithPopup } from 'firebase/auth';
import { firebaseAuth, googleProvider } from '../../../firebase-config';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  isGoogleLoading = false;

  constructor(
    private auth: AuthService, // ✅ เปลี่ยน
    private router: Router,
    private http: HttpClient,
  ) {}

  login() {
    const data = {
      email: this.email,
      password: this.password,
    };

    this.auth.login(data).subscribe({
      // ✅ เปลี่ยน
      next: (res: any) => {
        console.log('FULL RESPONSE = ', res);
        console.log('ROLE = ', res.role);

        const role = res.role;
        const backendUser = res.user || {};

        this.auth.saveToken(res.token); // ✅ เปลี่ยน (signal อัปเดตอัตโนมัติ)
        this.auth.saveRole(role); // ✅ เปลี่ยน (signal อัปเดตอัตโนมัติ)

        if (role === 'donor') {
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
          this.router.navigate(['/home-donor']);
        } else if (role === 'staff') {
          const staffPayload = {
            id: backendUser.id,
            name: backendUser.name || '',
            lastname: backendUser.lastname || '',
            email: backendUser.email || '',
            phone: backendUser.phone || '',
            role: backendUser.role || 'staff',
            status: backendUser.status || 'active',
          };
          localStorage.setItem('user', JSON.stringify(staffPayload));
          this.router.navigate(['/home-staff']);
        } else if (role === 'admin') {
          const adminPayload = {
            id: backendUser.id,
            name: backendUser.name || '',
            email: backendUser.email || '',
            phone: backendUser.phone || '',
          };
          localStorage.setItem('user', JSON.stringify(adminPayload));
          this.router.navigate(['/home-admin']); // ✅ แก้จาก /home-staff
        }
      },
      error: (err: any) => {
        alert(err.error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      },
    });
  }

  // ✅ ใหม่: เข้าสู่ระบบ/สมัครสมาชิกอัตโนมัติด้วย Google (เฉพาะบัญชีผู้บริจาค)
  async loginWithGoogle() {
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
            this.router.navigate(['/home-donor']);
          },
          error: (err) => {
            this.isGoogleLoading = false;
            alert(err.error?.message || 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ');
          },
        });
    } catch (err: any) {
      this.isGoogleLoading = false;
      // ผู้ใช้ปิดหน้าต่าง popup เอง ไม่ต้องแจ้ง error
      if (err?.code !== 'auth/popup-closed-by-user') {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ Google');
      }
    }
  }
}