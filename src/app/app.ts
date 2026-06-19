import { Component, OnInit, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { HeaderDonor } from './components/header-donor/header-donor';
import { SidebarAdmin } from './components/sidebar-admin/sidebar-admin';
import { SidebarStaff } from './components/sidebar-staff/sidebar-staff';
import { NgIf } from '@angular/common';
import { AuthService } from './services/api';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Header,
    HeaderDonor,
    SidebarAdmin,
    SidebarStaff,
    NgIf,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  currentUrl = '';

  constructor(
    public auth: AuthService,
    private router: Router,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects;
      });

    // ✅ แก้ effect ให้ reset เฉพาะตอน logout เท่านั้น
    effect(() => {
      if (!this.auth.isLoggedIn()) {
        this.currentUrl = '/';
      }
    });
  }

  ngOnInit() {
    this.currentUrl = window.location.pathname;

    if (this.auth.isAdmin() && window.location.pathname === '/') {
      this.router.navigate(['/home-admin']);
    }

    if (this.isStaff() && window.location.pathname === '/') {
      this.router.navigate(['/home-staff']);
    }
  }

  isAdminRoute(): boolean {
    return (
      this.currentUrl.startsWith('/home-admin') ||
      this.currentUrl.startsWith('/manage-accounts') ||
      this.currentUrl.startsWith('/settings') ||
      this.currentUrl.startsWith('/profile-admin')
    );
  }

  isStaff(): boolean {
    return localStorage.getItem('role') === 'staff';
  }

  isStaffRoute(): boolean {
    return (
      this.isStaff() &&
      (this.currentUrl.startsWith('/home-staff') ||
        this.currentUrl.startsWith('/donation-day-staff') ||
        this.currentUrl.startsWith('/announcement-staff') ||
        this.currentUrl.startsWith('/post-staff') ||
        this.currentUrl.startsWith('/profile-staff') ||
        this.currentUrl.startsWith('/record-staff') ||
        this.currentUrl.startsWith('/location-staff'))
    );
  }
}
