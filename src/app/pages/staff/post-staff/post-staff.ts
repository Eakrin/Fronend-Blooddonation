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
  donationDayId: number | null = null; // ตาม ER: Post เชื่อมกับ DONATION_Day (ส่ง DonationD_ID)
  selectedSlotId: number | null = null; // ช่วงรับบริจาคที่เลือก (Slot_ID)
  text = '';
  isLoading = false;
  errorMsg = '';
  posts: any[] = [];
  locations: any[] = [];
  donationDays: any[] = [];
  editingId: number | null = null;

  // ── รูปโปสเตอร์ (อัปโหลดขึ้น Cloudinary ผ่าน backend ระบบจะตัด/ย่อเป็น 1600x640 ให้เอง) ──
  imageFile: File | null = null; // ไฟล์ใหม่ที่เลือก
  imagePreview = ''; // ภาพตัวอย่าง (ไฟล์ใหม่ หรือรูปเดิมตอนแก้ไข)
  removeImage = false; // กดลบรูปเดิมตอนแก้ไข
  readonly maxImageMB = 10;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
    this.loadLocations();
    this.loadDonationDays();
  }

  private authHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  // เลือกช่วงรับบริจาค แล้วเติมวัน เวลา สถานที่ให้อัตโนมัติ
  onSlotChange() {
    const s = this.donationDays.find((d) => d.Slot_ID === this.selectedSlotId);
    if (!s) return;
    this.donationDate = String(s.Donation_date).split('T')[0];
    this.startTime = String(s.Start_time).slice(0, 5);
    this.endTime = String(s.End_time).slice(0, 5);
    this.locationId = s.Location_ID;
    this.donationDayId = s.DonationD_ID;
  }

  // เลือกไฟล์รูป: เช็กชนิดและขนาด แล้วทำภาพตัวอย่าง
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.errorMsg = 'รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP';
      input.value = '';
      return;
    }
    if (file.size > this.maxImageMB * 1024 * 1024) {
      this.errorMsg = `ไฟล์รูปต้องไม่เกิน ${this.maxImageMB} MB`;
      input.value = '';
      return;
    }

    this.errorMsg = '';
    this.imageFile = file;
    this.removeImage = false;

    const reader = new FileReader();
    reader.onload = () => (this.imagePreview = String(reader.result));
    reader.readAsDataURL(file);
  }

  // ลบรูป (ทั้งไฟล์ที่เพิ่งเลือก และรูปเดิมที่เคยบันทึกไว้)
  clearImage(fileInput?: HTMLInputElement) {
    this.imageFile = null;
    this.imagePreview = '';
    this.removeImage = true;
    if (fileInput) fileInput.value = '';
  }

  loadDonationDays() {
    this.http
      .get(environment.apiUrl + '/api/donation-day', this.authHeaders())
      .subscribe({
        next: (res: any) => {
          this.donationDays = res;
        },
        error: () => {},
      });
  }

  loadLocations() {
    this.http
      .get(environment.apiUrl + '/api/location', this.authHeaders())
      .subscribe({
        next: (res: any) => {
          this.locations = res;
        },
        error: () => {},
      });
  }

  loadPosts() {
    this.http
      .get(environment.apiUrl + '/api/post', this.authHeaders())
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

    // ส่งเป็น FormData เพราะมีไฟล์รูปแนบไปด้วย (browser จะตั้ง Content-Type ให้เอง)
    const data = new FormData();
    data.append('Toppic', this.topic);
    data.append('Text', this.text || '');
    data.append('DonationD_ID', String(this.donationDayId));
    data.append('Start_time', `${this.donationDate} ${this.startTime}`);
    data.append('End_time', `${this.donationDate} ${this.endTime}`);
    if (this.imageFile) data.append('image', this.imageFile);
    if (this.removeImage && !this.imageFile) data.append('remove_image', '1');

    const req = this.editingId
      ? this.http.put(
          `${environment.apiUrl}/api/post/${this.editingId}`,
          data,
          this.authHeaders(),
        )
      : this.http.post(
          environment.apiUrl + '/api/post',
          data,
          this.authHeaders(),
        );

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
    this.donationDayId = post.DonationD_ID;
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

    // แสดงรูปเดิมของประกาศนี้ (ถ้ามี) ไม่แนบไฟล์ใหม่ = คงรูปเดิม
    this.imageFile = null;
    this.removeImage = false;
    this.imagePreview = post.image || '';

    // เลือกช่วงรับบริจาคเดิมใน dropdown
    const match = this.donationDays.find(
      (d) =>
        d.DonationD_ID === post.DonationD_ID &&
        String(d.Start_time).slice(0, 5) === this.startTime,
    );
    this.selectedSlotId = match ? match.Slot_ID : null;
  }

  deletePost(id: number) {
    if (!confirm('ต้องการลบประกาศนี้ใช่ไหม?')) return;
    this.http
      .delete(`${environment.apiUrl}/api/post/${id}`, this.authHeaders())
      .subscribe({
        next: () => this.loadPosts(),
        error: (err) => {
          alert(err.error?.message || 'ลบไม่สำเร็จ');
        },
      });
  }

  resetForm() {
    this.topic = '';
    this.donationDate = '';
    this.startTime = '';
    this.endTime = '';
    this.locationId = null;
    this.donationDayId = null;
    this.selectedSlotId = null;
    this.text = '';
    this.editingId = null;
    this.errorMsg = '';
    this.imageFile = null;
    this.imagePreview = '';
    this.removeImage = false;
  }
}
