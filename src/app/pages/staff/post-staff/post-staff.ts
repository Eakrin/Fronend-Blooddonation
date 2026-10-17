import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-post-staff',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, DatePipe],
  templateUrl: './post-staff.html',
  styleUrl: './post-staff.css',
})
export class PostStaff implements OnInit {
  topic = '';
  donationDate = '';
  startTime = '';
  endTime = '';
  locationId: number | null = null; // ใช้แสดงชื่อสถานที่เท่านั้น (ไม่ส่งไป backend)
  donationDayId: number | null = null; // ✅ ตาม ER: Post เชื่อมกับ DONATION_Day (ส่ง DonationD_ID ไป backend)
  text = '';
  isLoading = false;
  errorMsg = '';
  posts: any[] = [];
  locations: any[] = [];
  timeSlots: string[] = []; // ✅ เพิ่ม
  editingId: number | null = null;
  donationDays: any[] = []; // ✅ เพิ่ม
  timeSlotOptions: any[] = []; // ✅ เพิ่ม

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
    this.loadLocations();
    this.generateTimeSlots(); // ✅ เพิ่ม
    this.loadDonationDays(); // ✅ เพิ่ม
  }

  // เมื่อเลือกวันที่แล้วให้ load time slots ของวันนั้น
  onDateChange() {
    const selected = this.donationDays.find((d) => {
      const date = new Date(d.Donation_date).toISOString().split('T')[0];
      return date === this.donationDate;
    });

    if (selected) {
      this.locationId = selected.Location_ID;
      this.donationDayId = selected.DonationD_ID; // ✅ ตาม ER
      // กรองเอา time slots ของวันนั้น
      this.timeSlotOptions = this.donationDays.filter((d) => {
        const date = new Date(d.Donation_date).toISOString().split('T')[0];
        return date === this.donationDate;
      });
    }
    this.startTime = '';
    this.endTime = '';
  }
  loadDonationDays() {
    // ✅ เพิ่ม
    const token = localStorage.getItem('token');
    this.http
      .get(environment.apiUrl + '/api/donation-day', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res: any) => {
          this.donationDays = res;
        },
        error: () => {},
      });
  }

  generateTimeSlots() {
    // ✅ เพิ่ม
    for (let h = 6; h <= 20; h++) {
      for (let m of [0, 30]) {
        const hour = h.toString().padStart(2, '0');
        const min = m.toString().padStart(2, '0');
        this.timeSlots.push(`${hour}:${min}`);
      }
    }
  }

  loadLocations() {
    const token = localStorage.getItem('token');
    this.http
      .get(environment.apiUrl + '/api/location', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res: any) => {
          this.locations = res;
        },
        error: () => {},
      });
  }

  loadPosts() {
    const token = localStorage.getItem('token');
    this.http
      .get(environment.apiUrl + '/api/post', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (res: any) => {
          this.posts = res;
        },
        error: () => {},
      });
  }

  getLocationName(id: number): string {
    const loc = this.locations.find((l) => l.Location_ID === id);
    return loc ? loc.name : '-';
  }

  savePost() {
    if (
      !this.topic ||
      !this.donationDate ||
      !this.startTime ||
      !this.endTime ||
      !this.donationDayId
    ) {
      this.errorMsg = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const token = localStorage.getItem('token');
    const data = {
      Toppic: this.topic,
      Text: this.text,
      DonationD_ID: this.donationDayId, // ✅ ตาม ER (แทน Location_ID เดิม)
      Start_time: `${this.donationDate} ${this.startTime}`,
      End_time: `${this.donationDate} ${this.endTime}`,
    };

    const req = this.editingId
      ? this.http.put(
          `${environment.apiUrl}/api/post/${this.editingId}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } },
        )
      : this.http.post(environment.apiUrl + '/api/post', data, {
          headers: { Authorization: `Bearer ${token}` },
        });

    req.subscribe({
      next: () => {
        this.isLoading = false;
        this.resetForm();
        this.loadPosts();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMsg = err.error?.message || 'เกิดข้อผิดพลาด';
      },
    });
  }

  editPost(post: any) {
    this.editingId = post.Post_ID;
    this.topic = post.Toppic;
    this.donationDayId = post.DonationD_ID; // ✅ ตาม ER
    const day = this.donationDays.find(
      (d) => d.DonationD_ID === post.DonationD_ID,
    );
    this.locationId = day ? day.Location_ID : null;
    this.text = post.Text || '';
    const start = new Date(post.Start_time);
    const end = new Date(post.End_time);
    this.donationDate = start.toISOString().split('T')[0];
    this.startTime = start.toTimeString().slice(0, 5);
    this.endTime = end.toTimeString().slice(0, 5);
  }

  deletePost(id: number) {
    if (!confirm('ต้องการลบประกาศนี้ใช่ไหม?')) return;
    const token = localStorage.getItem('token');
    this.http
      .delete(`${environment.apiUrl}/api/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: () => this.loadPosts(),
        error: () => {},
      });
  }

  resetForm() {
    this.topic = '';
    this.donationDate = '';
    this.startTime = '';
    this.endTime = '';
    this.locationId = null;
    this.donationDayId = null;
    this.text = '';
    this.editingId = null;
    this.errorMsg = '';
  }
}
