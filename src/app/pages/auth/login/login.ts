import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
    private http: HttpClient,
    private router: Router,
  ) {}

  login() {
    const data = {
      email: this.email,
      password: this.password,
    };

    this.http.post('http://localhost:3000/api/auth/login', data).subscribe({
      next: (res: any) => {
        const role = res.role;
        const backendUser = res.user || {};

        localStorage.setItem('token', res.token);
        localStorage.setItem('role', role);

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
            weight:
              backendUser.weight !== undefined && backendUser.weight !== null
                ? backendUser.weight
                : '',
            height:
              backendUser.height !== undefined && backendUser.height !== null
                ? backendUser.height
                : '',
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
      error: (err) => {
        alert(err.error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      },
    });
  }
}
