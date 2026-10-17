import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, DatePipe, RouterLink],
  templateUrl: './location.html',
  styleUrls: ['./location.css'],
})
export class Location implements OnInit {
  locations: any[] = [];
  donationDays: any[] = [];
  searchText = '';

  // ✅ ใหม่: เก็บ Location_ID ของสถานที่ที่ donor คนนี้มีการจองที่ยัง active อยู่แล้ว
  // (ยังไม่ถูกยกเลิก/ปฏิเสธ) ใช้เช็คว่าจะโชว์ปุ่ม "จองคิวบริจาค" หรือ "คุณจองแล้ว"
  bookedLocationIds = new Set<number>();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.loadDonationDays();
    this.loadMyBookings();
  }

  loadLocations() {
    this.http.get(environment.apiUrl + '/api/location').subscribe({
      next: (res: any) => {
        this.locations = res;
      },
      error: () => {},
    });
  }

  loadDonationDays() {
    this.http.get(environment.apiUrl + '/api/donation-day').subscribe({
      next: (res: any) => {
        this.donationDays = res;
      },
      error: () => {},
    });
  }

  // ✅ ใหม่: โหลดการจองของ donor คนนี้เอง (ถ้าล็อกอินอยู่) เพื่อดูว่าจองสถานที่ไหนไปแล้วบ้าง
  // ใช้ endpoint GET /api/booking ที่มีอยู่แล้ว (ตอนนี้ backend join มาให้แล้วว่าแต่ละ
  // booking ผูกกับ Location_ID ไหน ผ่าน Slot_ID -> Time_Slot -> DONATION_Day -> Location)
  loadMyBookings() {
    const token = localStorage.getItem('token');
    if (!token) return; // ยังไม่ล็อกอิน ไม่ต้องเช็ค ปล่อยให้กดจองแล้วเด้งไป /login เอง

    this.http
      .get<any[]>(environment.apiUrl + '/api/booking', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .subscribe({
        next: (bookings) => {
          this.bookedLocationIds = new Set(
            bookings
              .filter(
                (b) =>
                  b.booking_status === 'pending' ||
                  b.booking_status === 'approved',
              )
              .map((b) => b.Location_ID)
              .filter((id) => id != null),
          );
        },
        error: () => {},
      });
  }

  // ✅ ใหม่: เช็คว่าสถานที่นี้ donor จองไว้แล้ว (ยัง active) หรือยัง
  isLocationBooked(locationId: number): boolean {
    return this.bookedLocationIds.has(locationId);
  }

  get filteredLocations() {
    if (!this.searchText) return this.locations;
    return this.locations.filter(
      (l) =>
        l.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (l.address || '').toLowerCase().includes(this.searchText.toLowerCase()),
    );
  }

  getSlotsForLocation(locationId: number) {
    return this.donationDays.filter((d) => d.Location_ID === locationId);
  }

  book(locationId: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    // ✅ ใหม่: สถานที่ที่จองไปแล้ว (ยัง active) ไม่ให้กดจองซ้ำ กันไม่ให้ไปเจอหน้า
    // ทำแบบประเมินสุขภาพใหม่ทั้งที่จองสถานที่นี้ผ่านไปแล้ว
    if (this.isLocationBooked(locationId)) return;
    this.router.navigate(['/booking'], { queryParams: { locationId } });
  }
}
