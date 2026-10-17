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

  donor = {
    name: '',
    lastname: '',
    phone: '',
    gender: '',
    age: null as number | null,
    blood_type: '',
  };
  locationName: string | null = null;
  isLoadingDonor = true;

  // ✅ ตาม ER: ผู้บริจาคเป็นคนตอบแบบประเมินเอง เจ้าหน้าที่ดูผลอย่างเดียว (Health_Assessment ล่าสุดของผู้บริจาค)
  assessmentResult: string | null = null;
  assessmentDate: string | null = null;

  firstDonationDisplay: string | null = null;
  lastDonationDisplay: string | null = null;

  donationTypes: { DonationType_ID: number; Type: string }[] = [];
  donationTypeId: number | null = null;

  serviceDate = new Date().toISOString().slice(0, 10);
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
  hb: number | null = null; // ยังไม่มีคอลัมน์เก็บใน ER
  bloodVolume: number | null = null;
  notes = '';

  donationStatus: 'completed' | 'deferred' | 'incomplete' = 'completed';

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
          this.assessmentDate = res.assessment_date
            ? new Date(res.assessment_date).toLocaleString('th-TH')
            : null;
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
        error: () => {},
      });
  }

  getAssessmentLabel(status: string | null): string {
    const map: any = {
      pass: 'ผ่าน',
      pending: 'รอเจ้าหน้าที่ตรวจสอบ',
      fail: 'ไม่ผ่าน',
    };
    return status ? map[status] || status : 'ยังไม่ได้ทำแบบประเมิน';
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

    // ✅ เจ้าหน้าที่บันทึกเฉพาะส่วนของเจ้าหน้าที่ (Donation_Record) ไม่ส่งผลประเมินอีก
    const payload = {
      bookingId: this.bookingId,
      donation_datetime: `${this.serviceDate} ${this.serviceTime}:00`,
      pulse: this.pulse,
      temperature: this.temp,
      pressure: this.bp,
      donation_status: this.donationStatus,
      blood_volume: this.bloodVolume,
      height: this.height,
      weight: this.weight,
      donationTypeId: this.donationTypeId,
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
