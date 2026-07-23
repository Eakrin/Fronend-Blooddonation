import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/api';

type Severity = 'hard' | 'soft';
type ResultLevel = 'green' | 'yellow' | 'red';

@Component({
  selector: 'app-assessment-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './assessment-quiz.html',
  styleUrl: './assessment-quiz.css',
})
export class AssessmentQuiz implements OnInit {
  currentStep = 0;
  progressPercent = 0;

  // ✅ ผลลัพธ์ 3 ระดับ ตามสเปก 1.3.3.4
  // green  = ผ่าน จองคิวได้ทันที
  // yellow = มีคำตอบที่ต้องให้เจ้าหน้าที่ตรวจสอบก่อนอนุญาตให้จอง
  // red    = ไม่ผ่าน (มีคำตอบที่เป็นข้อห้ามเด็ดขาด)
  resultLevel: ResultLevel = 'green';
  failedQuestions: any[] = [];

  // คงชื่อ property เดิมไว้เผื่อมีที่อื่นในโค้ด (เช่น html) อ้างถึงอยู่
  get isAssessmentPassed(): boolean {
    return this.resultLevel === 'green';
  }

  stepTitles = [
    'ข้อมูลทั่วไปและประวัติการบริจาค',
    'สุขภาพทั่วไปและการตั้งครรภ์',
    'ประวัติความเสี่ยงการติดเชื้อและหัตถการ',
    'ประวัติสุขภาพเชิงลึก วัคซีน และโรคติดต่อ',
  ];

  donorHistory = {
    donationType: '',
    specificType: '',
    hasProblem: null as boolean | null,
    problemDetail: '',
    isDeferred: null as boolean | null,
    deferredReason: '',
  };

  // ── หมายเหตุการจัดระดับ severity ──────────────────────────────────────────
  // หลักการ: hard = ข้อห้ามเด็ดขาด/ภาวะปัจจุบันที่ห้ามบริจาคจริง ๆ (ตรงตามเกณฑ์สภากาชาดไทย)
  //          soft = ภาวะที่ต้องเลื่อนบริจาคเป็นการชั่วคราว หรือต้องให้เจ้าหน้าที่พิจารณาเป็นรายบุคคล
  // ข้อ 11 (ตั้งครรภ์/ให้นมบุตรอยู่ขณะนี้), 22 (ปลูกถ่ายอวัยวะ/เซลล์ต้นกำเนิด),
  // 24 (ตับอักเสบหลังอายุ 11 ปี), 26 (พาหะตับอักเสบ), 34 (อาการ/ผลตรวจ HIV),
  // 38 (ไม่มั่นใจว่าโลหิตปลอดภัย) → เป็นเงื่อนไขห้ามเด็ดขาดตามเกณฑ์จริง จัดเป็น hard
  // ข้อ 32 (ประวัติเสพยาเสพติด) → เกณฑ์จริงแยกกรณีฉีด (ห้ามเด็ดขาด) กับกิน (เลื่อน 1 ปี)
  //   แบบฟอร์มนี้เป็นคำถามใช่/ไม่ใช่เดียวแยกกรณีไม่ได้ จึงเลือก hard เพื่อความปลอดภัย
  // ข้อ 35, 36 (พำนักในสหราชอาณาจักร/ฝรั่งเศส/ไอร์แลนด์) → ตรวจสอบกับแบบฟอร์มจริงของสภากาชาดแล้ว
  //   พบว่าการพำนักเพียงอย่างเดียวไม่ได้ห้ามบริจาคทันที (ต้องใช้โลหิตที่ผ่านกระบวนการพิเศษ
  //   หรือมีประวัติ CJD ในครอบครัวจึงห้ามเด็ดขาด) จึงจัดเป็น soft ไม่ใช่ hard
  // ข้อ 4 (โรคประจำตัว) → ขึ้นกับชนิด/ความรุนแรงของโรค ต้องให้เจ้าหน้าที่พิจารณาเป็นรายบุคคล จึงเป็น soft
  questions: {
    id: number;
    step: number;
    question: string;
    expected: boolean;
    severity: Severity;
    userAnswer: boolean | null;
  }[] = [
    {
      id: 1,
      step: 1,
      question: 'คุณรู้สึกสบายดี สุขภาพแข็งแรง พร้อมที่จะบริจาคโลหิตหรือไม่?',
      expected: true,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 2,
      step: 1,
      question:
        'คุณนอนหลับพักผ่อนเพียงพอ (ไม่น้อยกว่า 5 ชั่วโมง) ในคืนที่ผ่านมาหรือไม่?',
      expected: true,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 3,
      step: 1,
      question:
        'คุณรับประทานอาหารที่มีไขมันสูง ภายใน 6 ชั่วโมงที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 4,
      step: 1,
      question: 'คุณมีโรคประจำตัว หรือเคยเป็นโรคประจำตัวร้ายแรงหรือไม่?',
      expected: false,
      severity: 'soft', // ขึ้นกับชนิดโรค ต้องให้เจ้าหน้าที่พิจารณาเป็นรายบุคคล
      userAnswer: null,
    },
    {
      id: 5,
      step: 1,
      question:
        'คุณรับประทานยาปฏิชีวนะ (ยาฆ่าเชื้อ) ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 6,
      step: 1,
      question:
        'คุณรับประทานยาแอสไพริน ยาคลายกล้ามเนื้อ หรือยาแก้ปวดข้อ ภายใน 2 วันที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 7,
      step: 1,
      question:
        'คุณมีการใช้ ยา หรือ สมุนไพร หรือ อาหารเสริม อื่นๆ เป็นประจำหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 8,
      step: 1,
      question: 'คุณดื่มแอลกอฮอล์ภายใน 24 ชั่วโมงที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 9,
      step: 1,
      question:
        'คุณเคยบริจาคเซลล์ต้นกำเนิดเม็ดโลหิต ในระยะ 6 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 10,
      step: 1,
      question:
        'คุณเคยตั้งครรภ์ หรือแท้งบุตร มาก่อนหรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 11,
      step: 1,
      question:
        'คุณอยู่ในช่วงตั้งครรภ์ หรือให้นมบุตรอยู่หรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      severity: 'hard', // ภาวะปัจจุบันที่ห้ามบริจาคเด็ดขาดในระยะนี้
      userAnswer: null,
    },
    {
      id: 12,
      step: 1,
      question:
        'คุณคลอดบุตร หรือแท้งบุตร ภายใน 6 เดือนที่ผ่านมาหรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 13,
      step: 2,
      question:
        'พฤติกรรมทางเพศ / เพศวิถี ของท่านในปัจจุบัน (เลือกข้อที่ตรงกับท่าน)',
      expected: true,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 14,
      step: 2,
      question:
        'ท่านหรือคู่ของท่านเคยมีเพศสัมพันธ์กับผู้ที่ไม่ใช่คู่ของตน / ผู้บริการทางเพศ / ผู้เสพยาเสพติด หรือผู้ติดเชื้อเอชไอวีหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 15,
      step: 2,
      question:
        'คุณเคยใช้ยารักษาหรือป้องกันการติดเชื้อเอชไอวี (เช่น PEP หรือ PrEP) หรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 16,
      step: 2,
      question:
        'คุณเพิ่งอุดฟัน ขูดหินปูน (ภายใน 3 วัน) หรือถอนฟัน รักษารากฟัน (ภายใน 7 วัน) ที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 17,
      step: 2,
      question: 'คุณมีอาการท้องเสีย ท้องร่วง ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 18,
      step: 2,
      question:
        'คุณทำหัตถการเสริมความงามผ่านผิวหนัง เช่น เจาะหู สัก ลบสัก ฝังเข็ม ฉีดสารต่างๆ ภายใน 4 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 19,
      step: 2,
      question: 'คุณได้รับการผ่าตัดเล็ก ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 20,
      step: 2,
      question: 'คุณได้รับการผ่าตัดใหญ่ ภายใน 6 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 21,
      step: 2,
      question:
        'คุณเจ็บป่วยและได้รับโลหิต หรือส่วนประกอบโลหิตจากผู้อื่น ภายใน 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 22,
      step: 2,
      question:
        'คุณเคยได้รับการปลูกถามอวัยวะ หรือเซลล์ต้นกำเนิดเม็ดโลหิตมาก่อนหรือไม่?',
      expected: false,
      severity: 'hard', // เกณฑ์จริง: ห้ามบริจาคเด็ดขาด
      userAnswer: null,
    },
    {
      id: 23,
      step: 2,
      question: 'คุณเคยถูกเข็มที่เปื้อนเลือดตำ ในระยะ 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 24,
      step: 3,
      question: 'คุณเคยป่วยเป็นโรคตับอักเสบ หลังอายุ 11 ปีหรือไม่?',
      expected: false,
      severity: 'hard', // เกณฑ์จริง: ห้ามบริจาคเด็ดขาด
      userAnswer: null,
    },
    {
      id: 25,
      step: 3,
      question:
        'คู่ของท่านหรือบุคคลในครอบครัว เป็นโรคตับอักเสบ ในระยะเวลา 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 26,
      step: 3,
      question: 'คุณเคยตรวจพบว่าเป็นพาหะของโรคตับอักเสบหรือไม่?',
      expected: false,
      severity: 'hard', // เกณฑ์จริง: ห้ามบริจาคเด็ดขาด
      userAnswer: null,
    },
    {
      id: 27,
      step: 3,
      question: 'คุณเคยป่วยเป็นโรคมาลาเรีย ในระยะ 3 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 28,
      step: 3,
      question:
        'คุณเคยเข้าไปในพื้นที่เชื้อมาลาเรียชุกชุม ในระยะ 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 29,
      step: 3,
      question:
        'คุณเคยป่วยเป็นไข้หวัดใหญ่ / ไข้เลือดออก / ชิคุนกุนยา / ไข้ซิกา / โควิด-19 ในระยะ 1 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 30,
      step: 3,
      question: 'คุณได้รับวัคซีนเพื่อป้องกันโรคในระยะ 2 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 31,
      step: 3,
      question:
        'คุณได้รับเซรุ่ม (เช่น เซรุ่มพิษสุนัขบ้า) ภายใน 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 32,
      step: 3,
      question: 'คุณเคยมีประวัติเสพยาเสพติด หรือใช้สารเสพติดให้โทษหรือไม่?',
      expected: false,
      // เกณฑ์จริง: ฉีด = ห้ามเด็ดขาด, กิน = เลื่อน 1 ปี — แบบฟอร์มนี้แยกกรณีไม่ได้
      // จึงเลือก hard เพื่อความปลอดภัยของผู้รับโลหิตเป็นหลัก
      severity: 'hard',
      userAnswer: null,
    },
    {
      id: 33,
      step: 3,
      question:
        'คุณเคยถูกควบคุมตัวหรือจองจำในเรือนจำติดต่อกันเกิน 72 ชั่วโมง ในช่วง 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 34,
      step: 3,
      question:
        'คุณเคยมีน้ำหนักลด มีไข้ มีต่อมน้ำเหลืองโตโดยไม่ทราบสาเหตุ ในระยะ 3 เดือน หรือเคยตรวจพบเชื้อ HIV หรือไม่?',
      expected: false,
      severity: 'hard', // มีส่วนของ "ตรวจพบเชื้อ HIV" ซึ่งเป็นข้อห้ามเด็ดขาด จึงจัด hard ทั้งข้อเพื่อความปลอดภัย
      userAnswer: null,
    },
    {
      id: 35,
      step: 3,
      question:
        'ช่วง พ.ศ. 2523 - 2539 คุณเคยพำนักในสหราชอาณาจักร สะสมรวมเกิน 3 เดือนหรือไม่?',
      expected: false,
      // ตรวจสอบกับเกณฑ์จริงแล้ว: พำนักอย่างเดียวไม่ได้ห้ามบริจาคทันที
      // (ต้องใช้โลหิตที่ผ่านกระบวนการพิเศษ หรือมีประวัติ CJD ในครอบครัวจึงห้ามเด็ดขาด)
      severity: 'soft',
      userAnswer: null,
    },
    {
      id: 36,
      step: 3,
      question:
        'ช่วง พ.ศ. 2523 - 2544 คุณเคยพำนักในฝรั่งเศส หรือไอร์แลนด์ สะสมรวมเกิน 5 ปีหรือไม่?',
      expected: false,
      severity: 'soft', // เหตุผลเดียวกับข้อ 35
      userAnswer: null,
    },
    {
      id: 37,
      step: 3,
      question:
        'คุณมีบาดแผลสด แผลติดเชื้อ หรือผื่นคันขึ้นตามร่างกายในขณะนี้หรือไม่?',
      expected: false,
      severity: 'soft', // ภาวะชั่วคราว รอให้แผล/ผื่นหายก่อนได้
      userAnswer: null,
    },
    {
      id: 38,
      step: 3,
      question:
        'คุณมั่นใจว่าโลหิตของท่านมีความปลอดภัยสูง และพร้อมส่งต่อเพื่อช่วยชีวิตผู้ป่วยหรือไม่?',
      expected: true,
      severity: 'hard', // การไม่มั่นใจ/ไม่ยืนยัน คือสัญญาณเสี่ยงที่ไม่เปิดเผยรายละเอียด ต้องกันไว้ก่อนอย่างเข้มงวด
      userAnswer: null,
    },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('assessment_passed');
    this.currentStep = 0;
    this.progressPercent = 0;
  }

  get filteredQuestions() {
    return this.questions.filter((q) => q.step === this.currentStep);
  }

  selectAnswer(id: number, answer: boolean) {
    const q = this.questions.find((item) => item.id === id);
    if (q) q.userAnswer = answer;
  }

  nextStep() {
    if (this.currentStep === 0) {
      this.currentStep = 1;
      this.updateProgress();
      return;
    }

    const hasUnanswered = this.filteredQuestions.some(
      (q) => q.userAnswer === null,
    );
    if (hasUnanswered) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อในหน้านี้ก่อนไปขั้นตอนถัดไปครับ');
      return;
    }

    if (this.currentStep < 3) {
      this.currentStep++;
      this.updateProgress();
    } else {
      this.checkAssessmentResult();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateProgress();
    }
  }

  checkAssessmentResult() {
    const wrongAnswers = this.questions.filter(
      (q) => q.userAnswer !== q.expected,
    );
    this.failedQuestions = wrongAnswers;

    const hasHardFail = wrongAnswers.some((q) => q.severity === 'hard');
    const hasSoftFail = wrongAnswers.some((q) => q.severity === 'soft');

    if (hasHardFail) {
      this.resultLevel = 'red';
    } else if (hasSoftFail) {
      this.resultLevel = 'yellow';
    } else {
      this.resultLevel = 'green';
    }

    this.saveAssessmentToDatabase();
    this.currentStep = 4; // ✅ แสดงผลก่อนเสมอ ไม่ redirect เลย
  }

  saveAssessmentToDatabase() {
    const token = this.auth.getToken();
    if (!token) return;

    // ✅ ค่าต้องตรงกับ ENUM ของคอลัมน์ result_status ในตาราง Health_Assessment จริง
    // (enum('pass','fail','pending')) ไม่ใช่ 'passed'/'failed'/'pending_review'
    const statusMap: Record<ResultLevel, string> = {
      green: 'pass',
      yellow: 'pending',
      red: 'fail',
    };

    const payload = {
      result_status: statusMap[this.resultLevel],
      assessment_date: new Date().toISOString(),
    };

    fetch('http://localhost:3000/api/health-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(() => {
        console.log('✅ บันทึก Health_Assessment สำเร็จ');
      })
      .catch((err) => {
        console.error('❌ บันทึกไม่สำเร็จ', err);
      });

    if (this.resultLevel === 'green') {
      localStorage.setItem('assessment_passed', 'true');
    } else {
      localStorage.removeItem('assessment_passed');
    }
  }

  resetAssessment() {
    localStorage.removeItem('assessment_passed');
    this.currentStep = 0;
    this.progressPercent = 0;
    this.resultLevel = 'green';
    this.failedQuestions = [];
    this.questions.forEach((q) => (q.userAnswer = null));
    this.donorHistory = {
      donationType: '',
      specificType: '',
      hasProblem: null,
      problemDetail: '',
      isDeferred: null,
      deferredReason: '',
    };
  }

  updateProgress() {
    if (this.currentStep === 0) this.progressPercent = 0;
    else if (this.currentStep === 1) this.progressPercent = 33;
    else if (this.currentStep === 2) this.progressPercent = 66;
    else if (this.currentStep === 3) this.progressPercent = 100;
  }
}
