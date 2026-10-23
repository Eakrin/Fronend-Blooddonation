import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact',
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  form = { name: '', email: '', topic: 'สอบถามการบริจาคโลหิต', message: '' };
  sent = false;

  // ตอนนี้แสดงข้อความขอบคุณอย่างเดียว (ยังไม่ได้ส่งเข้าฐานข้อมูล/อีเมล)
  submit() {
    this.sent = true;
    this.form = {
      name: '',
      email: '',
      topic: 'สอบถามการบริจาคโลหิต',
      message: '',
    };
    setTimeout(() => (this.sent = false), 6000);
  }
}
