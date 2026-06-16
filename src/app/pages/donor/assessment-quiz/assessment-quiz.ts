import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/api';

@Component({
  selector: 'app-assessment-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './assessment-quiz.html',
  styleUrl: './assessment-quiz.css',
})
export class AssessmentQuiz implements OnInit {
  currentStep = 0; // 0=ประวัติ, 1-3=คำถาม, 4=หน้าแสดงผลลัพธ์
  progressPercent = 0;

  // สถานะการตรวจคะแนน
  isAssessmentPassed = true;
  failedQuestions: any[] = [];

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

  questions = [
    // --- ขั้นตอนที่ 1 ---
    {
      id: 1,
      step: 1,
      question: 'คุณรู้สึกสบายดี สุขภาพแข็งแรง พร้อมที่จะบริจาคโลหิตหรือไม่?',
      expected: true,
      userAnswer: null as boolean | null,
    },
    {
      id: 2,
      step: 1,
      question:
        'คุณนอนหลับพักผ่อนเพียงพอ (ไม่น้อยกว่า 5 ชั่วโมง) ในคืนที่ผ่านมาหรือไม่?',
      expected: true,
      userAnswer: null as boolean | null,
    },
    {
      id: 3,
      step: 1,
      question:
        'คุณรับประทานอาหารที่มีไขมันสูง ภายใน 6 ชั่วโมงที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 4,
      step: 1,
      question: 'คุณมีโรคประจำตัว หรือเคยเป็นโรคประจำตัวร้ายแรงหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 5,
      step: 1,
      question:
        'คุณรับประทานยาปฏิชีวนะ (ยาฆ่าเชื้อ) ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 6,
      step: 1,
      question:
        'คุณรับประทานยาแอสไพริน ยาคลายกล้ามเนื้อ หรือยาแก้ปวดข้อ ภายใน 2 วันที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 7,
      step: 1,
      question:
        'คุณมีการใช้ ยา หรือ สมุนไพร หรือ อาหารเสริม อื่นๆ เป็นประจำหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 8,
      step: 1,
      question: 'คุณดื่มแอลกอฮอล์ภายใน 24 ชั่วโมงที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 9,
      step: 1,
      question:
        'คุณเคยบริจาคเซลล์ต้นกำเนิดเม็ดโลหิต ในระยะ 6 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 10,
      step: 1,
      question:
        'คุณเคยตั้งครรภ์ หรือแท้งบุตร มาก่อนหรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 11,
      step: 1,
      question:
        'คุณอยู่ในช่วงตั้งครรภ์ หรือให้นมบุตรอยู่หรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 12,
      step: 1,
      question:
        'คุณคลอดบุตร หรือแท้งบุตร ภายใน 6 เดือนที่ผ่านมาหรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      userAnswer: null as boolean | null,
    },

    // --- ขั้นตอนที่ 2 ---
    {
      id: 13,
      step: 2,
      question:
        'พฤติกรรมทางเพศ / เพศวิถี ของท่านในปัจจุบัน (เลือกข้อที่ตรงกับท่าน)',
      expected: true,
      userAnswer: null as boolean | null,
    },
    {
      id: 14,
      step: 2,
      question:
        'ท่านหรือคู่ของท่านเคยมีเพศสัมพันธ์กับผู้ที่ไม่ใช่คู่ของตน / ผู้บริการทางเพศ / ผู้เสพยาเสพติด หรือผู้ติดเชื้อเอชไอวีหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 15,
      step: 2,
      question:
        'คุณเคยใช้ยารักษาหรือป้องกันการติดเชื้อเอชไอวี (เช่น PEP หรือ PrEP) หรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 16,
      step: 2,
      question:
        'คุณเพิ่งอุดฟัน ขูดหินปูน (ภายใน 3 วัน) หรือถอนฟัน รักษารากฟัน (ภายใน 7 วัน) ที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 17,
      step: 2,
      question: 'คุณมีอาการท้องเสีย ท้องร่วง ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 18,
      step: 2,
      question:
        'คุณทำหัตถการเสริมความงามผ่านผิวหนัง เช่น เจาะหู สัก ลบสัก ฝังเข็ม ฉีดสารต่างๆ ภายใน 4 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 19,
      step: 2,
      question: 'คุณได้รับการผ่าตัดเล็ก ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 20,
      step: 2,
      question: 'คุณได้รับการผ่าตัดใหญ่ ภายใน 6 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 21,
      step: 2,
      question:
        'คุณเจ็บป่วยและได้รับโลหิต หรือส่วนประกอบโลหิตจากผู้อื่น ภายใน 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 22,
      step: 2,
      question:
        'คุณเคยได้รับการปลูกถามอวัยวะ หรือเซลล์ต้นกำเนิดเม็ดโลหิตมาก่อนหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 23,
      step: 2,
      question: 'คุณเคยถูกเข็มที่เปื้อนเลือดตำ ในระยะ 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },

    // --- ขั้นตอนที่ 3 ---
    {
      id: 24,
      step: 3,
      question: 'คุณเคยป่วยเป็นโรคตับอักเสบ หลังอายุ 11 ปีหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 25,
      step: 3,
      question:
        'คู่ของท่านหรือบุคคลในครอบครัว เป็นโรคตับอักเสบ ในระยะเวลา 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 26,
      step: 3,
      question: 'คุณเคยตรวจพบว่าเป็นพาหะของโรคตับอักเสบหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 27,
      step: 3,
      question: 'คุณเคยป่วยเป็นโรคมาลาเรีย ในระยะ 3 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 28,
      step: 3,
      question:
        'คุณเคยเข้าไปในพื้นพื้นที่เชื้อมาลาเรียชุกชุม ในระยะ 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 29,
      step: 3,
      question:
        'คุณเคยป่วยเป็นไข้หวัดใหญ่ / ไข้เลือดออก / ชิคุนกุนยา / ไข้ซิกา / โควิด-19 ในระยะ 1 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 30,
      step: 3,
      question: 'คุณได้รับวัคซีนเพื่อป้องกันโรคในระยะ 2 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 31,
      step: 3,
      question:
        'คุณได้รับเซรุ่ม (เช่น เซรุ่มพิษสุนัขบ้า) ภายใน 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 32,
      step: 3,
      question: 'คุณเคยมีประวัติเสพยาเสพติด หรือใช้สารเสพติดให้โทษหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 33,
      step: 3,
      question:
        'คุณเคยถูกควบคุมตัวหรือจองจำในเรือนจำติดต่อกันเกิน 72 ชั่วโมง ในช่วง 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 34,
      step: 3,
      question:
        'คุณเคยมีน้ำหนักลด มีไข้ มีต่อมน้ำเหลืองโตโดยไม่ทราบสาเหตุ ในระยะ 3 เดือน หรือเคยตรวจพบเชื้อ HIV หรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 35,
      step: 3,
      question:
        'ช่วง พ.ศ. 2523 - 2539 คุณเคยพำนักในสหราชอาณาจักร สะสมรวมเกิน 3 เดือนหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 36,
      step: 3,
      question:
        'ช่วง พ.ศ. 2523 - 2544 คุณเคยพำนักในฝรั่งเศส หรือไอร์แลนด์ สะสมรวมเกิน 5 ปีหรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 37,
      step: 3,
      question:
        'คุณมีบาดแผลสด แผลติดเชื้อ หรือผื่นคันขึ้นตามร่างกายในขณะนี้หรือไม่?',
      expected: false,
      userAnswer: null as boolean | null,
    },
    {
      id: 38,
      step: 3,
      question:
        'คุณมั่นใจว่าโลหิตของท่านมีความปลอดภัยสูง และพร้อมส่งต่อเพื่อช่วยชีวิตผู้ป่วยหรือไม่?',
      expected: true,
      userAnswer: null as boolean | null,
    },
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // เช็กสถานะ: ถ้าเคยทำแบบประเมินผ่านไปแล้ว ให้ข้ามมาแสดงหน้าสรุปผลสีเขียวทันที
    const savedStatus = localStorage.getItem('assessment_passed');
    if (savedStatus === 'true') {
      this.currentStep = 4;
      this.isAssessmentPassed = true;
      this.progressPercent = 100;
    }
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
    this.failedQuestions = this.questions.filter(
      (q) => q.userAnswer !== q.expected,
    );

    this.isAssessmentPassed = this.failedQuestions.length === 0;

    // เรียกเซฟข้อมูลและล็อกสถานะหน้าจอ
    this.saveAssessmentToDatabase();

    // ไปที่สเต็ป 4 หน้าจอสรุปผลลัพธ์
    this.currentStep = 4;
  }

  saveAssessmentToDatabase() {
    const token = this.auth.getToken();
    if (!token) {
      alert('❌ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
      return;
    }

    // เตรียมโครงสร้างข้อมูลที่จะยิงขึ้นหลังบ้าน
    const payload = {
      is_passed: this.isAssessmentPassed,
      history: this.donorHistory,
      answers: this.questions.map((q) => ({
        question_id: q.id,
        answer: q.userAnswer,
      })),
    };

    // 🌟 แก้ปัญหา Property ts(7053) โดยใช้ type casting หลบการตรวจสอบของ TS ชั่วคราว
    const anyAuth = this.auth as any;
    if (typeof anyAuth.createAssessment === 'function') {
      anyAuth.createAssessment(payload, token).subscribe({
        next: (res: any) => {
          console.log('✅ บันทึกแบบประเมินลงตาราง Database สำเร็จ', res);
        },
        error: (err: any) => {
          console.error('❌ หลังบ้านเกิดข้อผิดพลาดในการบันทึกข้อมูล', err);
        },
      });
    }

    // กลไกล็อกหน้าจอของระบบผู้ใช้: ถ้าผ่านเกณฑ์ให้ทำการบันทึกลงบราวเซอร์ทันที
    if (this.isAssessmentPassed) {
      localStorage.setItem('assessment_passed', 'true');
    }
  }

  resetAssessment() {
    // เมื่อผู้ใช้กดทำใหม่ ให้ปลดล็อกความทรงจำของเครื่องออกด้วย
    localStorage.removeItem('assessment_passed');

    this.currentStep = 0;
    this.progressPercent = 0;
    this.isAssessmentPassed = true;
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
