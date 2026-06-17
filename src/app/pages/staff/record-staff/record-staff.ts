import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-record-staff',
  standalone: true,
  imports: [NgFor, NgClass, FormsModule],
  templateUrl: './record-staff.html',
  styleUrl: './record-staff.css',
})
export class RecordStaff {
  bp = '';
  pulse: number | null = null;
  temp: number | null = null;
  height: number | null = null;
  weight: number | null = null;
  hb: number | null = null;
  bloodType = '';
  bloodVolume: number | null = null;
  lastDonation = '';
  firstDonation = '';
  notes = '';

  questions = [
    {
      th: 'นอนหลับพักผ่อนเพียงพอ ไม่น้อยกว่า 5-6 ชั่วโมง ในคืนก่อนวันบริจาค',
      en: 'Slept at least 5-6 hours last night.',
      answer: null as boolean | null,
    },
    {
      th: 'มีอาการไข้ หวัด เจ็บคอ หรืออาการป่วยอื่นๆ ในช่วง 7 วันที่ผ่านมา',
      en: 'Any fever, cold, or illness in the last 7 days.',
      answer: null as boolean | null,
    },
    {
      th: 'รับประทานยาแก้อักเสบ หรือปฏิชีวนะอื่นๆ ในช่วง 7 วันที่ผ่านมา',
      en: 'Taken antibiotics or anti-inflammatory drugs in last 7 days.',
      answer: null as boolean | null,
    },
    {
      th: 'เคยได้รับการถอนฟัน ขูดหินปูน หรือทำศัลยกรรมช่องปากใน 3 วันที่ผ่านมา',
      en: 'Dental treatment in the last 3 days.',
      answer: null as boolean | null,
    },
    {
      th: 'พฤติกรรมเสี่ยงทางเพศสัมพันธ์ หรือใช้ยาเสพติดชนิดฉีด',
      en: 'Risk behaviors or intravenous drug use.',
      answer: null as boolean | null,
    },
  ];

  get isReady(): boolean {
    return !!(this.bp && this.pulse && this.temp && this.hb && this.bloodType);
  }

  constructor(private http: HttpClient) {}

  saveAll() {
    alert('บันทึกข้อมูลสำเร็จ');
  }
}
