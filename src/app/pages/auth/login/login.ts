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

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    const data = {
      email: this.email,
      password: this.password
    };

    this.http.post('http://localhost:3000/login', data)
      .subscribe({
        next: (res: any) => {
          // เก็บ Token ไว้ใน localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify({
  id: res.user.id,
  name: res.user.name,
  lastname: res.user.lastname,
  email: res.user.email,
  blood_type: res.user.blood_type
}));

          alert('เข้าสู่ระบบสำเร็จ!');
          this.router.navigate(['/home-donor']);
        },
        error: (err) => {
          alert(err.error.message);
        }
      });
  }

}
