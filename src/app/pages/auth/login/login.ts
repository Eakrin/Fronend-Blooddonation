import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/api';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';

  constructor(
    private auth: AuthService, // ✅ เปลี่ยน
    private router: Router,
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
          this.router.navigate(['/home-admin']);
        }
      },
      error: (err: any) => {
        alert(err.error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      },
    });
  }
}
