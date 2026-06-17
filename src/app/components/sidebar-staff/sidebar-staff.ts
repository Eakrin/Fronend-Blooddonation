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
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.staffName = parsed.name + ' ' + (parsed.lastname || '');
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
