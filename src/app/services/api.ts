import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = 'http://localhost:3000/api';

  // ✅ Signal อัปเดต UI อัตโนมัติ
  isLoggedIn = signal(!!localStorage.getItem('token'));
  isAdmin = signal(localStorage.getItem('role') === 'admin');

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.api}/auth/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  createBooking(data: any, token: string) {
    return this.http.post(`${this.api}/booking`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  getBooking(token: string) {
    return this.http.get(`${this.api}/booking`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.isLoggedIn.set(true); // ✅
  }

  saveRole(role: string) {
    localStorage.setItem('role', role);
    this.isAdmin.set(role === 'admin'); // ✅
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRole() {
    return localStorage.getItem('role');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.isLoggedIn.set(false); // ✅
    this.isAdmin.set(false); // ✅
  }
}
