import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.loadDonationDays();
  }

  loadLocations() {
    this.http.get('http://localhost:3000/api/location').subscribe({
      next: (res: any) => {
        this.locations = res;
      },
      error: () => {},
    });
  }

  loadDonationDays() {
    this.http.get('http://localhost:3000/api/donation-day').subscribe({
      next: (res: any) => {
        this.donationDays = res;
      },
      error: () => {},
    });
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
    this.router.navigate(['/booking'], { queryParams: { locationId } });
  }
}
