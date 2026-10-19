import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/api'; // ปรับ path ให้ตรงกับโปรเจกต์จริง

interface DashboardData {
  totalDonors: number;
  todayBookings: number;
  cancelledToday: number;
  recentActivity: {
    name: string;
    time: string;
    bloodType: string;
    status: string;
  }[];
  weeklyStats: number[];
}

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-admin.html',
  styleUrl: './home-admin.css',
})
export class HomeAdmin implements OnInit {
  data: DashboardData | null = null;
  days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const token = this.authService.getToken();
    if (!token) return;

    this.authService.getDashboard(token).subscribe({
      next: (res: any) => (this.data = res),
      error: (err) => console.error('โหลด dashboard ไม่สำเร็จ', err),
    });
  }

  statusLabel(status: string) {
    const map: Record<string, string> = {
      approved: 'ยืนยันแล้ว',
      pending: 'รอดำเนินการ',
      rejected: 'ไม่ผ่านเกณฑ์',
      cancelled: 'ยกเลิก',
    };
    return map[status] || status;
  }

  statusClass(status: string) {
    const map: Record<string, string> = {
      approved: 'status-success',
      pending: 'status-warning',
      rejected: 'status-danger',
      cancelled: 'status-danger',
    };
    return map[status] || '';
  }

  formatTime(datetime: string) {
    return (
      new Date(datetime).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      }) + ' น.'
    );
  }

  barHeight(count: number) {
    if (!this.data) return 0;
    const max = Math.max(...this.data.weeklyStats, 1);
    return Math.round((count / max) * 100);
  }
}
