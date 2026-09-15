import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-record-staff',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  templateUrl: './record-staff.html',
  styleUrl: './record-staff.css',
})
export class RecordStaff implements OnInit {
  bookingId: number | null = null;

  // ✅ ใหม่: ข้อมูลผู้บริจาคจริง ดึงมาจาก backend แทนของ hardcode เดิม
  donor = {
    name: '',
    lastname: '',
    phone: '',
    gender: '',
    age: null as number | null,
    blood_type: '',
  };
  // ✅ ใหม่: ชื่อสถานที่รับบริจาค (null ถ้าการจองนี้ยังไม่ผูก Time_Slot จริง)
  locationName: string | null = null;
  isLoadingDonor = true;

  // ✅ ใหม่: "ผลการประเมิน" ดึงมาจาก Health_assessment ที่ผูกกับ booking นี้อยู่แล้ว (ไม่ใช่คอลัมน์ใหม่)
  assessmentResult: string | null = null;

  // ✅ ใหม่: "บริจาคครั้งแรก/ครั้งล่าสุด" คำนวณจากประวัติ Donation_Record จริง (read-only แสดงผลอย่างเดียว)
  firstDonationDisplay: string | null = null;
  lastDonationDisplay: string | null = null;

  // ✅ ใหม่: รายการประเภทการบริจาค ดึงจากตาราง Donationtype (มีอยู่แล้วใน ER)
  donationTypes: { DonationType_ID: number; Type: string }[] = [];
  donationTypeId: number | null = null;

  // ✅ ใหม่: แยกวันกับเวลาเป็นคนละช่อง (default เป็นตอนนี้ แก้ไขได้)
  // แยกเพราะช่อง datetime-local รวมของเบราว์เซอร์ใช้งานสับสน (ปฏิทิน+เวลาปนกันในหน้าต่างเดียว)
  serviceDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  serviceTime = (() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  })();

  bp = '';
  pulse: number | null = null;
  temp: number | null = null;
  height: number | null = null;
  weight: number | null = null;
  hb: number | null = null; // หมายเหตุ: ค่านี้ยังไม่มีคอลัมน์เก็บใน Donation_Record ตาม ER ปัจจุบัน (ดูข้อความด้านล่างฟอร์ม)
  bloodVolume: number | null = null;
  notes = '';

  // ✅ ใหม่: สถานะการบริจาค ตรงกับ ENUM ของ Donation_Record.donation_status
  donationStatus: 'completed' | 'deferred' | 'incomplete' = 'completed';

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
    // ✅ ใหม่: เพิ่ม 2 ข้อที่ขาดไปตาม requirement 1.3.2.8
    {
      th: 'อยู่ระหว่างตั้งครรภ์ หรือสงสัยว่าตั้งครรภ์',
      en: 'Currently pregnant or suspect pregnancy.',
      answer: null as boolean | null,
    },
    {
      th: 'เคยได้รับเซรุมหรือวัคซีนในช่วง 1 เดือนที่ผ่านมา',
      en: 'Received serum or vaccine in the last month.',
      answer: null as boolean | null,
    },
  ];

  get isReady(): boolean {
    return !!(this.bp && this.pulse && this.temp && this.donationStatus);
  }

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('bookingId');
    this.bookingId = idParam ? Number(idParam) : null;

    if (this.bookingId) {
      this.loadBookingInfo(this.bookingId);
    } else {
      this.isLoadingDonor = false;
    }

    this.loadDonationTypes();
  }

  // ✅ ใหม่: ดึงข้อมูลผู้บริจาค+การจองจริง มาแทนที่ข้อมูล hardcode
  // รวมถึง "ผลการประเมิน" (จาก Health_assessment) และ "วันบริจาคครั้งแรก/ล่าสุด" (คำนวณจาก Donation_Record)
  loadBookingInfo(bookingId: number): void {
    const token = localStorage.getItem('token');
    this.http
      .get<any>(`http://localhost:3000/api/record/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          this.donor = {
            name: res.name || '',
            lastname: res.lastname || '',
            phone: res.phone || '',
            gender: res.gender || '',
            age: res.age,
            blood_type: res.blood_type || '',
          };
          this.locationName = res.location_name;
          this.assessmentResult = res.assessment_result;
          this.firstDonationDisplay = res.first_donation
            ? new Date(res.first_donation).toLocaleDateString('th-TH')
            : 'ยังไม่เคยบริจาค (ครั้งแรก)';
          this.lastDonationDisplay = res.last_donation
            ? new Date(res.last_donation).toLocaleDateString('th-TH')
            : 'ยังไม่เคยบริจาค';
          this.isLoadingDonor = false;
        },
        error: (err) => {
          this.isLoadingDonor = false;
          alert(err.error?.message || 'โหลดข้อมูลผู้บริจาคไม่สำเร็จ');
        },
      });
  }

  // ✅ ใหม่: ดึงรายการประเภทการบริจาค (ตาราง Donationtype) มาทำ dropdown
  loadDonationTypes(): void {
    const token = localStorage.getItem('token');
    this.http
      .get<any[]>('http://localhost:3000/api/record/donation-types', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res) => {
          this.donationTypes = res;
        },
        error: () => {
          // ไม่ critical ถ้าโหลดไม่ได้ แค่ dropdown จะว่าง ไม่บล็อกการทำงานส่วนอื่น
        },
      });
  }

  // ✅ label ผลประเมินให้อ่านง่ายในหัวข้อ (ตรงกับ ENUM ของ Health_assessment.result_satatus)
  getAssessmentLabel(status: string | null): string {
    const map: any = {
      pass: 'ผ่าน',
      pending: 'เหลือง (ต้องพิจารณา)',
      fail: 'ไม่ผ่าน',
    };
    return status ? map[status] || status : 'ไม่มีข้อมูล';
  }

  saveAll() {
    if (!this.bookingId) {
      alert('ไม่พบ Booking ID กรุณาเข้าหน้านี้จากรายชื่อผู้จองเท่านั้น');
      return;
    }
    if (!this.isReady) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const token = localStorage.getItem('token');

    // ✅ ใหม่: แปลง 7 ข้อคำถามเป็น array ส่งให้ backend ไป insert ตาราง Assessment_Question
    const answers = this.questions.map((q) => ({
      question_text: q.th,
      answer: q.answer,
      score: null,
    }));

    const payload = {
      bookingId: this.bookingId,
      donation_datetime: `${this.serviceDate} ${this.serviceTime}:00`,
      pulse: this.pulse,
      temperature: this.temp,
      pressure: this.bp, // ชื่อฝั่ง backend คือ "pressure" ตาม ER (ฝั่งฟอร์มใช้ตัวแปรชื่อ bp)
      donation_status: this.donationStatus,
      blood_volume: this.bloodVolume,
      height: this.height,
      weight: this.weight,
      donationTypeId: this.donationTypeId, // ✅ ใหม่: ประเภทการบริจาค (อัปเดตไว้ที่ Booking ตาม ER)
      answers,
    };

    this.http
      .post('http://localhost:3000/api/record', payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => {
          alert('บันทึกข้อมูลสำเร็จ');
          this.router.navigate(['/home-staff']);
        },
        error: (err) => {
          alert(err.error?.message || 'บันทึกข้อมูลไม่สำเร็จ');
        },
      });
  }
}
