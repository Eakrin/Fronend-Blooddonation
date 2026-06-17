import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  phone = '02-419-7000';
  email = 'contact@suthawet.go.th';
  weekdayStart = '08:30';
  weekdayEnd = '16:30';
  address = '';
}
