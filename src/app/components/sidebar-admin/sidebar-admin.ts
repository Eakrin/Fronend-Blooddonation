import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../services/api';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-sidebar-admin',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './sidebar-admin.html',
  styleUrl: './sidebar-admin.css',
})
export class SidebarAdmin implements OnInit {
  isCollapsed = false; // คอม/ไอแพด: พับเป็นแถบไอคอน
  isMobile = false; // มือถือ: เมนูเป็นแผงเลื่อนทับ
  isOpen = false; // มือถือ: แผงเปิดอยู่หรือไม่

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.applySize();
  }

  @HostListener('window:resize')
  applySize() {
    const w = window.innerWidth;
    this.isMobile = w <= 768;
    if (this.isMobile) {
      this.isCollapsed = false; // บนมือถือแสดงเมนูเต็มเมื่อเปิดแผง
    } else {
      this.isOpen = false;
      this.isCollapsed = w <= 1024; // ไอแพดพับเป็นไอคอน คอมแสดงเต็ม
    }
  }

  toggle() {
    if (this.isMobile) {
      this.isOpen = !this.isOpen;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }

  closeMobile() {
    if (this.isMobile) this.isOpen = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
