import { Component, OnInit, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { HeaderDonor } from './components/header-donor/header-donor';
import { SidebarAdmin } from './components/sidebar-admin/sidebar-admin';
import { SidebarStaff } from './components/sidebar-staff/sidebar-staff'; // ✅ เพิ่ม
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
  ], // ✅ เพิ่ม
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

    effect(() => {
      if (!this.auth.isAdmin()) {
        this.currentUrl = window.location.pathname;
      }
    });
  }

  ngOnInit() {
    this.currentUrl = window.location.pathname;

    if (this.auth.isAdmin() && window.location.pathname === '/') {
      this.router.navigate(['/home-admin']);
    }

    // ✅ เพิ่ม
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

  // ✅ เพิ่ม
  isStaff(): boolean {
    return localStorage.getItem('role') === 'staff';
  }

  // ✅ เพิ่ม
  isStaffRoute(): boolean {
    return (
      this.currentUrl.startsWith('/home-staff') ||
      this.currentUrl.startsWith('/schedule-staff') ||
      this.currentUrl.startsWith('/post-staff') ||
      this.currentUrl.startsWith('/profile-staff') ||
      this.currentUrl.startsWith('/record-staff') ||
      this.currentUrl.startsWith('/location-staff')
    );
  }
}
