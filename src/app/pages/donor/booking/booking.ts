import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 🌟 1. เพิ่มการ Import RouterModule เข้ามาจากแองกูลาร์ด้านบนนี้ครับ
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/api';

@Component({
  selector: 'app-booking',
  standalone: true,
  // 🌟 2. เอา RouterModule มาใส่เพิ่มในกล่องก้อนอิมพอร์ตตรงนี้ด้วยครับ
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class BookingComponent {
  donationType = 'whole';
  location = 'sutthavej';
  selectedDate = 10;
  selectedTime = '09:30';

  constructor(private auth: AuthService) {}

  selectType(type: string) {
    this.donationType = type;
  }

  selectLocation(loc: string) {
    this.location = loc;
  }

  selectDate(date: number) {
    this.selectedDate = date;
  }

  selectTime(time: string) {
    this.selectedTime = time;
  }

  confirmBooking() {
    const token = this.auth.getToken();

    if (!token) {
      alert('❌ กรุณา login ก่อน');
      return;
    }

    const booking_datetime = `2026-05-${this.selectedDate}T${this.selectedTime}:00`;

    this.auth.createBooking({ booking_datetime }, token).subscribe({
      next: () => {
        alert('✅ จองสำเร็จ');
      },
      error: (err) => {
        console.log(err);
        alert(err.error?.message || '❌ เกิดข้อผิดพลาด');
      },
    });
  }
}
