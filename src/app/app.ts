import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Header } from './components/header/header';
import { HeaderDonor } from './components/header-donor/header-donor';
import { SidebarAdmin } from './components/sidebar-admin/sidebar-admin';
import { NgIf } from '@angular/common';
import { AuthService } from './services/api';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, HeaderDonor, SidebarAdmin, NgIf],
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
  }

  ngOnInit() {
    // ✅ ใช้ window.location.pathname แทน router.url
    this.currentUrl = window.location.pathname;

    if (this.auth.isAdmin() && window.location.pathname === '/') {
      this.router.navigate(['/home-admin']);
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
}
