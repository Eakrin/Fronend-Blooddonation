import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../services/api';

@Component({
  selector: 'app-sidebar-staff',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './sidebar-staff.html',
  styleUrl: './sidebar-staff.css',
})
export class SidebarStaff implements OnInit {
  isCollapsed = false;
  staffName = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    if (window.innerWidth <= 768) {
      this.isCollapsed = true;
    }

    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.staffName = parsed.name + ' ' + (parsed.lastname || '');
    }
  }

  closeOnMobile() {
    if (window.innerWidth <= 768) {
      this.isCollapsed = true;
    }
  }

  toggle() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
