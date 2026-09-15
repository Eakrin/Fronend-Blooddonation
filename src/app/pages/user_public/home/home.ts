import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../services/api';

interface CareItem {
  title: string;
  desc: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgFor, NgIf],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  posts: any[] = [];

  // ── แท็บก่อน/หลังบริจาค ──
  activeCareTab: 'before' | 'after' = 'before';

  careBefore: CareItem[] = [
    {
      title: 'พักผ่อนให้เพียงพอ',
      desc: 'นอนหลับอย่างน้อย 6 ชั่วโมง ให้ร่างกายพร้อมสำหรับการบริจาค',
    },
    {
      title: 'ดื่มน้ำมากๆ',
      desc: 'ดื่มน้ำ 3-4 แก้ว ก่อนมาถึง 30 นาที เพื่อลดอาการวูบ',
    },
    {
      title: 'งดยาบางชนิด',
      desc: 'แจ้งเจ้าหน้าที่หากรับประทานยาแก้ปวดหรือยาละลายลิ่มเลือด',
    },
    {
      title: 'งดเครื่องดื่มแอลกอฮอล์',
      desc: 'หลีกเลี่ยงแอลกอฮอล์อย่างน้อย 24 ชั่วโมงก่อนบริจาค',
    },
  ];

  careAfter: CareItem[] = [
    {
      title: 'พักผ่อนไม่เร่งรีบ',
      desc: 'นั่งพักอย่างน้อย 15 นาที ก่อนลุกเดินหรือขับรถ',
    },
    {
      title: 'ดื่มน้ำมากๆ',
      desc: 'ดื่มน้ำเพิ่มอีก 3-4 แก้วตลอดวัน เพื่อชดเชยของเหลว',
    },
    {
      title: 'งดออกกำลังกายหนัก',
      desc: 'หลีกเลี่ยงการยกของหนักหรือออกกำลังกาย 24 ชั่วโมง',
    },
    {
      title: 'สังเกตอาการตนเอง',
      desc: 'หากมีอาการวูบหรือผิดปกติ ติดต่อเจ้าหน้าที่ทันที',
    },
  ];

  // ── วิดีโอแนะนำ (YouTube) ──
  videoId = 'BERz-VhCb2o';
  videoThumbnail = `https://img.youtube.com/vi/BERz-VhCb2o/maxresdefault.jpg`;
  videoUrl: SafeResourceUrl;
  isVideoOpen = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private auth: AuthService,
    private router: Router,
  ) {
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.videoId}?autoplay=1&rel=0`,
    );
  }

  // ── กดจองคิว: ต้องล็อคอินก่อนเท่านั้น ──
  goToBooking() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/booking']);
    } else {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจองคิวบริจาคโลหิต');
      this.router.navigate(['/login']);
    }
  }

  openVideo() {
    this.isVideoOpen = true;
  }

  closeVideo() {
    this.isVideoOpen = false;
  }

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.http.get('http://localhost:3000/api/post').subscribe({
      next: (res: any) => {
        this.posts = res.slice(0, 3);
      },
      error: () => {},
    });
  }

  setCareTab(tab: 'before' | 'after') {
    this.activeCareTab = tab;
  }

  get activeCareItems(): CareItem[] {
    return this.activeCareTab === 'before' ? this.careBefore : this.careAfter;
  }
}
