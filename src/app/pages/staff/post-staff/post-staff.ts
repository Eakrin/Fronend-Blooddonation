import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
  locationId: number | null = null;
  text = '';
  isLoading = false;
  errorMsg = '';
  posts: any[] = [];
  locations: any[] = [];
  timeSlots: string[] = []; // ✅ เพิ่ม
  editingId: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPosts();
    this.loadLocations();
    this.generateTimeSlots(); // ✅ เพิ่ม
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
      .get('http://localhost:3000/api/location', {
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
      .get('http://localhost:3000/api/post', {
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
      !this.locationId
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
      Location_ID: this.locationId,
      Start_time: `${this.donationDate} ${this.startTime}`,
      End_time: `${this.donationDate} ${this.endTime}`,
    };

    const req = this.editingId
      ? this.http.put(
          `http://localhost:3000/api/post/${this.editingId}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } },
        )
      : this.http.post('http://localhost:3000/api/post', data, {
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
    this.locationId = post.Location_ID;
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
      .delete(`http://localhost:3000/api/post/${id}`, {
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
    this.text = '';
    this.editingId = null;
    this.errorMsg = '';
  }
}
