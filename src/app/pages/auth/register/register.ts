import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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

  constructor(
    private http: HttpClient,
    private router: Router,
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
}
