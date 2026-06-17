import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-manage-accounts',
  standalone: true,
  imports: [NgIf], // ✅ เพิ่ม
  templateUrl: './manage-accounts.html',
  styleUrl: './manage-accounts.css',
})
export class ManageAccounts {
  isModalOpen = false; // ✅ เพิ่ม

  constructor(private router: Router) {}

  openModal() {
    // ✅ เพิ่ม
    this.isModalOpen = true;
  }

  closeModal() {
    // ✅ เพิ่ม
    this.isModalOpen = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }
}
