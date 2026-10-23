import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../../services/api';
import { environment } from '../../../../environments/environment';

interface CareItem {
  title: string;
  desc: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, NgFor, NgIf, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, OnDestroy {
  posts: any[] = [];

  // ── แบนเนอร์สไลด์ ──
  // image: ภาพโปสเตอร์กิจกรรมของเราเอง วางไฟล์ไว้ใน src/assets/ (ขนาดแนะนำ 1600x640 พิกเซล)
  // ถ้าหาไฟล์ภาพไม่เจอ จะแสดงพื้นสีพร้อมข้อความแทนอัตโนมัติ
  // action: 'booking' = ไปหน้าจองคิว, หรือใส่ path เช่น '/news'
  slides = [
    {
      tag: 'จองคิวออนไลน์',
      title: 'หนึ่งการให้ ต่อลมหายใจให้คนอีกมากมาย',
      subtitle: 'จองช่วงเวลาบริจาคโลหิตล่วงหน้า ไม่ต้องรอคิว',
      button: 'จองคิวบริจาค',
      action: 'booking',
      image: 'assets/banner1.jpg',
      bg: 'linear-gradient(135deg, #7f1d1d, #c1121f 60%, #e11d29)',
    },
    {
      tag: 'ความปลอดภัยสูงสุด',
      title: 'ประเมินสุขภาพออนไลน์ก่อนบริจาค',
      subtitle: 'ตอบแบบประเมินตามเกณฑ์สภากาชาดไทย ใช้เวลาไม่กี่นาที',
      button: 'เริ่มจองคิว',
      action: 'booking',
      image: 'assets/banner2.jpg',
      bg: 'linear-gradient(135deg, #1f1a1a, #4a1212 60%, #a30f1a)',
    },
    {
      tag: 'ข่าวสารและกิจกรรม',
      title: 'ติดตามกิจกรรมและหน่วยรับบริจาคล่าสุด',
      subtitle: 'ข่าวสารจากศูนย์รับบริจาคโลหิตสุธาเวช',
      button: 'ดูข่าวสารทั้งหมด',
      action: '/news',
      image: 'assets/banner3.jpg',
      bg: 'linear-gradient(135deg, #a30f1a, #d81b2e 60%, #ef4444)',
    },
  ];
  currentSlide = 0;
  private slideTimer: any;

  // ── แท็บก่อน/หลังบริจาค ──
  activeCareTab: 'before' | 'after' = 'before';

  careBefore: CareItem[] = [
    {
      title: 'พักผ่อนให้เพียงพอ',
      desc: 'นอนหลับอย่างน้อย 5 ชั่วโมง ให้ร่างกายพร้อมสำหรับการบริจาค',
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

  // ── ป็อบอัพต้อนรับ ──
  showWelcome = false;
  factIndex = 0;
  private factTimer: any;

  welcomeFacts = [
    {
      icon: 'favorite',
      title: 'ถุงเดียว ช่วยได้ถึง 3 ชีวิต',
      text: 'โลหิต 1 ถุงถูกแยกเป็นเม็ดเลือดแดง เกล็ดเลือด และพลาสมา ส่งต่อให้ผู้ป่วยได้หลายราย',
    },
    {
      icon: 'timer',
      title: 'ใช้เวลาเก็บเลือดเพียง 10 นาที',
      text: 'ทั้งขั้นตอนรวมตรวจสุขภาพและพักผ่อนใช้เวลาไม่นาน แต่เป็นประโยชน์ต่อคนอื่นมหาศาล',
    },
    {
      icon: 'autorenew',
      title: 'ร่างกายสร้างเลือดใหม่ได้เอง',
      text: 'หลังบริจาค ร่างกายจะทดแทนเลือดที่เสียไป และบริจาคซ้ำได้ทุก 3 เดือน',
    },
    {
      icon: 'verified_user',
      title: 'ปลอดภัย ใช้อุปกรณ์ครั้งเดียวทิ้ง',
      text: 'เข็มและถุงเก็บโลหิตใช้ครั้งเดียว และมีการตรวจคัดกรองโดยบุคลากรทางการแพทย์',
    },
  ];

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
    this.loadBanners();
    this.startSlider();
    this.openWelcome();
  }

  // แบนเนอร์จากประกาศที่เจ้าหน้าที่แนบรูปไว้ (ถ้ายังไม่มี ใช้แบนเนอร์ตั้งต้นด้านบน)
  loadBanners() {
    this.http.get(environment.apiUrl + '/api/post/banners').subscribe({
      next: (res: any) => {
        if (Array.isArray(res) && res.length > 0) {
          this.slides = res.map((b: any) => ({
            tag: '',
            title: b.Toppic,
            subtitle: '',
            button: '',
            action: '/news',
            image: b.image,
            bg: 'linear-gradient(135deg, #7f1d1d, #c1121f 60%, #e11d29)',
          }));
          this.currentSlide = 0;
        }
      },
      error: () => {},
    });
  }

  ngOnDestroy() {
    this.stopSlider();
    if (this.factTimer) clearInterval(this.factTimer);
  }

  loadPosts() {
    this.http.get(environment.apiUrl + '/api/post').subscribe({
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

  // ── แบนเนอร์สไลด์ ──
  startSlider() {
    this.stopSlider();
    this.slideTimer = setInterval(() => this.nextSlide(), 5000);
  }

  stopSlider() {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(i: number) {
    this.currentSlide = i;
  }

  onSlideAction(action: string) {
    if (action === 'booking') this.goToBooking();
    else this.router.navigate([action]);
  }

  // ── ป็อบอัพต้อนรับ ──
  openWelcome() {
    this.showWelcome = true;
    this.factTimer = setInterval(() => this.nextFact(), 4000);
  }

  closeWelcome() {
    this.showWelcome = false;
    if (this.factTimer) clearInterval(this.factTimer);
  }

  bookFromWelcome() {
    this.closeWelcome();
    this.goToBooking();
  }

  nextFact() {
    this.factIndex = (this.factIndex + 1) % this.welcomeFacts.length;
  }

  setFact(i: number) {
    this.factIndex = i;
    if (this.factTimer) clearInterval(this.factTimer);
    this.factTimer = setInterval(() => this.nextFact(), 4000);
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.showWelcome) this.closeWelcome();
  }
}
