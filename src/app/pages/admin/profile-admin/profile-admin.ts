import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-admin',
  imports: [FormsModule],
  templateUrl: './profile-admin.html',
  styleUrl: './profile-admin.css',
})
export class profileAdmin {
  email = 'admin.suthawet@hospital.go.th';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
}
