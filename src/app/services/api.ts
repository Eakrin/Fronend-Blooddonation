import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.api}/login`, data);
  }

  register(data: any) {
    return this.http.post(`${this.api}/register`, data);
  }

  createBooking(data: any, token: string) {
    return this.http.post(`${this.api}/booking`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  getBooking(token: string) {
    return this.http.get(`${this.api}/booking`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }
}
