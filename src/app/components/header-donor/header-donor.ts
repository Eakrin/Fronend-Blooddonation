import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/api'; // ✅ เพิ่ม

@Component({
  selector: 'app-header-donor',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './header-donor.html',
  styleUrl: './header-donor.css',
})
export class HeaderDonor implements OnInit {
  userName = '';
  showDropdown = false;

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {} // ✅ เพิ่ม

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.userName = parsed.name + ' ' + (parsed.lastname || '');
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  goToProfile() {
    this.showDropdown = false;
    this.router.navigate(['/edit-profile']);
  }

  logout() {
    this.showDropdown = false;
    this.auth.logout(); // ✅ ล้างทุกอย่างพร้อม signal
    this.router.navigate(['/']);
  }
}
