import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/api';

interface StepItem {
  number: string;
  title: string;
  desc: string;
  icon: string;
}

interface CareItem {
  title: string;
  desc: string;
}

interface CriteriaItem {
  label: string;
  value: string;
  ok: boolean;
}

@Component({
  selector: 'app-donation-process',
  imports: [NgFor],
  templateUrl: './donation-process.html',
  styleUrl: './donation-process.css',
})
export class DonationProcess {
  activeTab: 'before' | 'after' = 'before';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  goToBooking() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/booking']);
    } else {
      alert('กรุณาเข้าสู่ระบบก่อนทำการจองคิวบริจาคโลหิต');
      this.router.navigate(['/login']);
    }
  }

  steps: StepItem[] = [
    {
      number: 'STEP 01',
      icon: 'assignment',
      title: 'ลงทะเบียนและกรอกข้อมูล',
      desc: 'ลงทะเบียนผ่านเว็บไซต์หรือที่จุดรับบริจาค กรอกแบบฟอร์มข้อมูลผู้บริจาคและตอบแบบประเมินสุขภาพเบื้องต้นตามเกณฑ์สภากาชาดไทย',
    },
    {
      number: 'STEP 02',
      icon: 'monitor_heart',
      title: 'ตรวจร่างกายเบื้องต้น',
      desc: 'เจ้าหน้าที่จะวัดความดันโลหิต ชั่งน้ำหนัก และตรวจค่าความเข้มข้นของเลือด (Hemoglobin) เพื่อประเมินว่าร่างกายพร้อมสำหรับการบริจาคหรือไม่',
    },
    {
      number: 'STEP 03',
      icon: 'fact_check',
      title: 'พบแพทย์และซักประวัติ',
      desc: 'แพทย์หรือพยาบาลจะซักประวัติสุขภาพเพิ่มเติม และยืนยันความพร้อมก่อนเริ่มกระบวนการบริจาคจริง',
    },
    {
      number: 'STEP 04',
      icon: 'water_drop',
      title: 'บริจาคโลหิต',
      desc: 'ใช้เวลาประมาณ 10-15 นาทีต่อครั้ง ปริมาณโลหิตที่บริจาคประมาณ 350-450 มิลลิลิตร ในบรรยากาศที่สะอาดปลอดภัย',
    },
    {
      number: 'STEP 05',
      icon: 'self_improvement',
      title: 'พักผ่อนและรับของว่าง',
      desc: 'พักที่จุดสังเกตอาการอย่างน้อย 15 นาที รับเครื่องดื่มและของว่างเพื่อฟื้นฟูร่างกาย ก่อนกลับบ้านอย่างปลอดภัย',
    },
  ];

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
      title: 'รับประทานอาหารก่อนมา',
      desc: 'ไม่ควรบริจาคโลหิตขณะท้องว่าง ควรทานอาหารมาก่อนอย่างน้อย 4 ชั่วโมง',
    },
    {
      title: 'งดยาบางชนิด',
      desc: 'แจ้งเจ้าหน้าที่หากรับประทานยาแก้ปวดหรือยาละลายลิ่มเลือด',
    },
    {
      title: 'งดเครื่องดื่มแอลกอฮอล์',
      desc: 'หลีกเลี่ยงแอลกอฮอล์อย่างน้อย 24 ชั่วโมงก่อนบริจาค',
    },
    {
      title: 'พกบัตรประชาชน',
      desc: 'นำบัตรประจำตัวประชาชนหรือบัตรที่ออกโดยราชการมาแสดงในวันบริจาค',
    },
  ];

  careAfter: CareItem[] = [
    {
      title: 'พักผ่อนไม่เร่งรีบ',
      desc: 'นั่งพักอย่างน้อย 15 นาที ก่อนลุกเดินหรือขับรถ',
    },
    {
      title: 'ดื่มน้ำมากๆ',
      desc: 'ดื่มน้ำเพิ่มอีก 3-4 แก้วตลอดวัน เพื่อชดเชยของเหลวที่เสียไป',
    },
    {
      title: 'งดออกกำลังกายหนัก',
      desc: 'หลีกเลี่ยงการยกของหนักหรือออกกำลังกายอย่างหนัก 24 ชั่วโมง',
    },
    {
      title: 'อย่าดึงพลาสเตอร์เร็วเกินไป',
      desc: 'ปิดพลาสเตอร์แผลไว้อย่างน้อย 4-6 ชั่วโมง เพื่อป้องกันการติดเชื้อ',
    },
    {
      title: 'สังเกตอาการตนเอง',
      desc: 'หากมีอาการวูบ เวียนศีรษะ หรือผิดปกติ ติดต่อเจ้าหน้าที่หรือสถานพยาบาลใกล้บ้านทันที',
    },
    {
      title: 'เว้นระยะก่อนบริจาคครั้งถัดไป',
      desc: 'บริจาคโลหิตรวมครั้งถัดไปได้เมื่อครบ 3 เดือน (90 วัน) ตามเกณฑ์สภากาชาดไทย',
    },
  ];

  get activeCareItems(): CareItem[] {
    return this.activeTab === 'before' ? this.careBefore : this.careAfter;
  }

  setTab(tab: 'before' | 'after') {
    this.activeTab = tab;
  }

  eligibility: CriteriaItem[] = [
    {
      label: 'อายุ',
      value: '17-70 ปี (ผู้บริจาคครั้งแรกไม่เกิน 60 ปี)',
      ok: true,
    },
    { label: 'น้ำหนัก', value: '45 กิโลกรัมขึ้นไป', ok: true },
    {
      label: 'ระยะห่างจากการบริจาคครั้งล่าสุด',
      value: 'อย่างน้อย 8 สัปดาห์ (56 วัน)',
      ok: true,
    },
    {
      label: 'สุขภาพทั่วไป',
      value: 'ไม่มีอาการเจ็บป่วย ไม่อยู่ระหว่างมีประจำเดือนที่มีผลต่อร่างกาย',
      ok: true,
    },
  ];

  deferralList: string[] = [
    'มีไข้ ไม่สบาย หรือเพิ่งหายจากการเจ็บป่วยภายใน 7 วัน',
    'เพิ่งเจาะหู เจาะร่างกาย หรือสักผิวหนังภายใน 4 เดือน',
    'เพิ่งถอนฟันหรือทำฟันภายใน 3-7 วัน',
    'เพิ่งได้รับวัคซีนบางชนิด ควรแจ้งเจ้าหน้าที่ก่อนบริจาค',
    'อยู่ระหว่างตั้งครรภ์ หรือคลอดบุตรมาไม่ถึง 6 เดือน',
    'มีพฤติกรรมเสี่ยงต่อการติดเชื้อทางเพศสัมพันธ์ในช่วง 4 เดือนที่ผ่านมา',
  ];
}
