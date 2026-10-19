import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/api';

@Component({
  selector: 'app-header-donor',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './header-donor.html',
  styleUrl: './header-donor.css',
})
export class HeaderDonor implements OnInit {
  userName = '';
  showDropdown = false;
  isMenuOpen = false;

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.userName = parsed.name + ' ' + (parsed.lastname || '');
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) this.isMenuOpen = false;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.showDropdown = false;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  goToProfile() {
    this.showDropdown = false;
    this.router.navigate(['/edit-profile']);
  }

  logout() {
    this.showDropdown = false;
    this.isMenuOpen = false;
    this.auth.logout(); // ล้างทุกอย่างพร้อม signal
    this.router.navigate(['/']);
  }
}
