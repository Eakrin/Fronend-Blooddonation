import { Component } from '@angular/core';
import { AuthService } from '../../services/api';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common'; // ✅ เพิ่ม

@Component({
  selector: 'app-sidebar-admin',
  imports: [RouterLink, RouterLinkActive, NgIf], // ✅ เพิ่ม NgIf
  templateUrl: './sidebar-admin.html',
  styleUrl: './sidebar-admin.css',
})
export class SidebarAdmin {
  isCollapsed = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  toggle() {
    this.isCollapsed = !this.isCollapsed; // ✅ เพิ่ม
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
