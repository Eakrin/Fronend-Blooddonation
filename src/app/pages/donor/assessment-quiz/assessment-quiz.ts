import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/api';
import { environment } from '../../../../environments/environment';

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

  // ผลลัพธ์ 3 ระดับ: green = ผ่าน / yellow = ให้เจ้าหน้าที่ตรวจสอบ / red = ไม่ผ่าน
  resultLevel: ResultLevel = 'green';
  failedQuestions: any[] = [];

  // ตาม ER: คะแนนที่ได้ = ผลรวม Score ของข้อที่ตอบถูก
  scoreEarned = 0;
  scoreMax = 0;

  // เส้นทางหน้าแก้ไขโปรไฟล์ (ถ้าใน app.routes.ts ใช้ path อื่น ให้แก้ตรงนี้ที่เดียว)
  private readonly profilePath = '/edit-profile';

  get isAssessmentPassed(): boolean {
    return this.resultLevel === 'green';
  }

  get isAssessmentPending(): boolean {
    return this.resultLevel === 'yellow';
  }

  get resultReason(): string {
    if (this.resultLevel === 'red') {
      return 'ขณะนี้สุขภาพหรือประวัติของท่านยังไม่เข้าเกณฑ์การบริจาคโลหิตของสภากาชาดไทย';
    }
    if (this.resultLevel === 'yellow') {
      return 'เจ้าหน้าที่จะซักถามข้อมูลสุขภาพเพิ่มเติมก่อนวันบริจาค';
    }
    return '';
  }

  // เหตุผลรายข้อ อ้างอิง: ศูนย์บริการโลหิตแห่งชาติ สภากาชาดไทย (คุณสมบัติผู้บริจาคโลหิต)
  private readonly reasonMap: Record<number, string> = {
    1: 'ผู้บริจาคต้องมีความพร้อมทั้งร่างกายและจิตใจ ไม่มีอาการอ่อนเพลีย มึนเมา หรืออาการผิดปกติ',
    2: 'ต้องนอนหลับพักผ่อนอย่างน้อย 5 ชั่วโมง เพื่อลดความเสี่ยงอ่อนเพลียและภาวะแทรกซ้อนหลังบริจาค',
    3: 'อาหารไขมันสูงทำให้พลาสมาขุ่นขาว นำไปให้ผู้ป่วยไม่ได้ ควรเว้นอย่างน้อย 6 ชั่วโมงก่อนบริจาค',
    4: 'โรคประจำตัวบางชนิดต้องงดบริจาค (เช่น มะเร็งทุกชนิดงดถาวร) บางโรคบริจาคได้เมื่อควบคุมอาการได้ตามเกณฑ์ ต้องให้เจ้าหน้าที่ประเมิน',
    5: 'ยาปฏิชีวนะบ่งชี้ว่าอาจมีการติดเชื้อ ต้องเว้น 7 วันหลังรับประทานยาเม็ดสุดท้าย',
    6: 'ยาแอสไพรินและยาแก้ปวดลดอักเสบ (NSAID) มีผลต่อเกล็ดเลือด เจ้าหน้าที่จะพิจารณาชนิดการบริจาคให้เหมาะสม',
    7: 'ยาบางกลุ่ม (เช่น ฮอร์โมนเพศ) มีผลต่อผู้รับโลหิต ต้องให้เจ้าหน้าที่ประเมินชนิดและระยะเวลาที่ต้องเว้น',
    8: 'แอลกอฮอล์มีผลต่อระบบไหลเวียนโลหิตและทำให้ร่างกายขาดน้ำ ต้องงดดื่ม 24 ชั่วโมงก่อนบริจาค',
    9: 'การบริจาคหรือปลูกถ่ายเซลล์ต้นกำเนิดเม็ดโลหิตต้องให้เจ้าหน้าที่ประเมินระยะเวลาที่ต้องเว้น',
    10: 'ประวัติการตั้งครรภ์หรือแท้งบุตรต้องให้เจ้าหน้าที่ซักถามเพิ่มเติม (หลังคลอดหรือแท้งต้องเว้น 6 เดือน)',
    11: 'ผู้ตั้งครรภ์หรือให้นมบุตรต้องงดบริจาคชั่วคราว เพราะอาจเกิดภาวะซีด เสี่ยงแท้ง และกระทบน้ำนม บริจาคได้หลังบุตรหย่านม',
    12: 'การคลอดหรือแท้งบุตรทำให้เสียโลหิตมาก ต้องงด 6 เดือนเพื่อให้ร่างกายสร้างเม็ดเลือดแดงกลับสู่ปกติ',
    13: 'พฤติกรรมทางเพศบางลักษณะ (เปลี่ยนคู่ใหม่ มีคู่ซ้อน หรือพฤติกรรมเสี่ยง) ต้องงดบริจาค 4 เดือน เพื่อให้พ้นระยะ window period ของการติดเชื้อ',
    14: 'การมีเพศสัมพันธ์กับผู้มีพฤติกรรมเสี่ยง เสี่ยงติดเชื้อที่ถ่ายทอดทางโลหิต ต้องงดบริจาค 4 เดือนนับจากครั้งสุดท้าย',
    15: 'ยา PEP/PrEP ทำให้ตรวจเชื้อเอชไอวีไม่พบในขนาดต่ำ ต้องงด 1 ปีหลังยากิน หรือ 2 ปีหลังยาฉีด',
    16: 'การทำฟันอาจทำให้เชื้อเข้าสู่กระแสโลหิตโดยไม่มีอาการ ต้องเว้น 3 วัน (อุดฟัน ขูดหินปูน) หรือ 7 วัน (ถอนฟัน รักษารากฟัน)',
    17: 'อาการท้องเสียอาจเกิดจากการติดเชื้อ ต้องหายขาดอย่างน้อย 7 วัน (หากกินยาฆ่าเชื้อให้เว้นอีก 7 วันหลังยาเม็ดสุดท้าย)',
    18: 'การเจาะ สัก ฝังเข็ม ฉีดสารต่าง ๆ นอกโรงพยาบาลเสี่ยงติดเชื้อ HIV ไวรัสตับอักเสบ บี และ ซี ต้องเว้น 4 เดือน',
    19: 'การผ่าตัดเล็กต้องเว้น 7 วัน เพื่อให้บาดแผลหายสนิท',
    20: 'การผ่าตัดใหญ่ต้องเว้น 6 เดือน เพื่อให้ร่างกายแข็งแรงและแผลหายดี (หากได้รับโลหิตร่วมด้วยต้องเว้น 1 ปี)',
    21: 'การได้รับโลหิตหรือส่วนประกอบโลหิตจากผู้อื่นมีความเสี่ยงต่อการติดเชื้อ ต้องงดบริจาค 1 ปี',
    22: 'ผู้ที่เคยปลูกถ่ายอวัยวะหรือเซลล์ต้นกำเนิดเม็ดโลหิต ต้องงดบริจาคถาวร เพราะยากดภูมิคุ้มกันอาจเป็นอันตรายต่อผู้รับโลหิต',
    23: 'การถูกเข็มเปื้อนเลือดตำเสี่ยงต่อการติดเชื้อ ต้องงด 1 ปี เพื่อให้พ้นระยะ window period',
    24: 'การเป็นตับอักเสบหลังอายุ 11 ปี ส่วนใหญ่เกิดจากไวรัสตับอักเสบ บี หรือ ซี ต้องงดบริจาคถาวร (เว้นแต่มีใบรับรองแพทย์ว่าเกิดจากสาเหตุอื่น)',
    25: 'ผู้ใกล้ชิดเป็นตับอักเสบทำให้มีความเสี่ยงติดเชื้อ ต้องงดบริจาค 1 ปี',
    26: 'ผู้เป็นพาหะของตับอักเสบบีต้องงดบริจาคถาวร เพื่อป้องกันการถ่ายทอดเชื้อไปยังผู้ป่วย',
    27: 'ผู้ที่เคยเป็นมาลาเรียต้องงดบริจาค 3 ปีหลังรักษาหายขาด',
    28: 'การเข้าพื้นที่ที่มีเชื้อมาลาเรียชุกชุมต้องงดบริจาค 1 ปี เพราะยังไม่มีการตรวจเชื้อมาลาเรียในโลหิตบริจาค',
    29: 'ต้องรอให้หายป่วยและพ้นระยะที่กำหนด เช่น ไข้หวัดใหญ่ 2 สัปดาห์ ไข้เลือดออก 1 เดือน โควิด-19 14 วัน ชิคุนกุนยาและซิกา 6 เดือน',
    30: 'วัคซีนแต่ละชนิดมีระยะเว้นต่างกัน เช่น 24 ชั่วโมง (ไข้หวัดใหญ่) 21 วัน (ตับอักเสบ บี) 4 สัปดาห์ (หัด คางทูม อีสุกอีใส)',
    31: 'การได้รับเซรุ่มต้องให้เจ้าหน้าที่ประเมินระยะเวลาที่ต้องเว้นตามชนิดของเซรุ่ม',
    32: 'ยาเสพติดชนิดฉีดต้องงดบริจาคถาวร ส่วนชนิดกินต้องเลิกอย่างน้อย 1 ปี เพราะเสี่ยงติดเชื้อทางโลหิตและมีผลต่อจิตประสาท',
    33: 'ผู้ที่เคยถูกควบคุมตัวในเรือนจำมีความเสี่ยงติดเชื้อ HIV HBV HCV สูงกว่า ต้องงด 1 ปีนับจากวันที่ปล่อยตัว',
    34: 'อาการดังกล่าวอาจเป็นอาการระยะแรกของการติดเชื้อเอชไอวีหรือโรคร้ายแรงอื่น ต้องงดบริจาคจนกว่าจะทราบสาเหตุ (หากพบเชื้อเอชไอวีงดถาวร)',
    35: 'ความเสี่ยงโรควัวบ้า (CJD) จากการพำนักในสหราชอาณาจักรช่วง พ.ศ. 2523-2539 เกิน 3 เดือน ต้องให้เจ้าหน้าที่พิจารณาการบริจาค',
    36: 'ความเสี่ยงโรควัวบ้า (CJD) จากการพำนักในฝรั่งเศสหรือไอร์แลนด์ช่วง พ.ศ. 2523-2544 สะสมเกิน 5 ปี ต้องให้เจ้าหน้าที่พิจารณาการบริจาค',
    37: 'ผู้บริจาคต้องไม่มีแผลหรือผื่นบนร่างกาย เพราะอาจติดเชื้อและปนเปื้อนสู่โลหิต',
    38: 'ผู้บริจาคต้องมั่นใจว่าโลหิตของตนปลอดภัย หากไม่มั่นใจควรงดบริจาคเพื่อความปลอดภัยของผู้ป่วย',
  };

  // รายการเหตุผลของข้อที่ตอบไม่เข้าเกณฑ์ ใช้แสดงในหน้าผลลัพธ์
  get failedReasons(): { id: number; text: string }[] {
    return this.failedQuestions.map((q) => ({
      id: q.id,
      text:
        this.reasonMap[q.id] ?? 'คำตอบไม่เข้าเกณฑ์การบริจาคโลหิตของสภากาชาดไทย',
    }));
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

  // ข้อ hard = ข้อห้ามเด็ดขาด, ข้อที่เหลือ = soft (ให้เจ้าหน้าที่พิจารณา)
  private readonly hardQuestionIds = [11, 22, 24, 26, 32, 34, 38];

  // คำถามโหลดจากตาราง Assessment_Question
  // expected = answer ในตาราง (1 = คำตอบที่ถูกคือ "ใช่", 0 = "ไม่ใช่")
  questions: {
    id: number;
    step: number;
    question: string;
    expected: boolean;
    severity: Severity;
    score: number;
    userAnswer: boolean | null;
  }[] = [];

  isLoadingQuestions = true;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('assessment_passed');
    this.currentStep = 0;
    this.progressPercent = 0;
    this.loadQuestions();
    this.checkProfile(); // บัญชี Google ที่ยังกรอกโปรไฟล์ไม่ครบ จะถูกส่งไปกรอกก่อน
  }

  // บัญชี Google ที่ยังกรอกโปรไฟล์ไม่ครบ ต้องกรอกก่อนจึงทำแบบประเมินได้
  checkProfile() {
    const token = this.auth.getToken();
    fetch(environment.apiUrl + '/api/health-assessment/profile-status', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((r: any) => {
        if (r && r.complete === false) {
          alert(
            'กรุณากรอกข้อมูลส่วนตัวให้ครบก่อนทำแบบประเมิน\nข้อมูลที่ยังขาด: ' +
              r.missing.join(', '),
          );
          this.router.navigate([this.profilePath]);
        }
      })
      .catch(() => {});
  }

  loadQuestions() {
    const token = this.auth.getToken();
    fetch(environment.apiUrl + '/api/health-assessment/questions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((rows: any[]) => {
        this.questions = rows.map((r) => ({
          id: r.AQ_ID,
          // แบ่งขั้นตอนตามเลขข้อ: 1-12 = ขั้น 1, 13-23 = ขั้น 2, 24 ขึ้นไป = ขั้น 3
          step: r.AQ_ID <= 12 ? 1 : r.AQ_ID <= 23 ? 2 : 3,
          question: r.question_text,
          expected: Number(r.answer) === 1,
          severity: this.hardQuestionIds.includes(r.AQ_ID) ? 'hard' : 'soft',
          score: Number(r.Score) || 0,
          userAnswer: null,
        }));
        this.isLoadingQuestions = false;
      })
      .catch(() => {
        this.isLoadingQuestions = false;
        alert('โหลดคำถามแบบประเมินไม่สำเร็จ');
      });
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
    } else {
      // ขั้นแรก: ย้อนกลับออกจากหน้าแบบประเมินไปหน้าหลัก
      this.router.navigate(['/home-donor']);
    }
  }

  checkAssessmentResult() {
    const wrongAnswers = this.questions.filter(
      (q) => q.userAnswer !== q.expected,
    );
    this.failedQuestions = wrongAnswers;

    // คำนวณคะแนน: ตอบถูกได้ Score (ปกติ 1) ตอบผิดได้ 0
    this.scoreMax = this.questions.reduce((sum, q) => sum + q.score, 0);
    this.scoreEarned = this.questions
      .filter((q) => q.userAnswer === q.expected)
      .reduce((sum, q) => sum + q.score, 0);

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
    this.currentStep = 4; // แสดงผลก่อนเสมอ
  }

  saveAssessmentToDatabase() {
    const token = this.auth.getToken();
    if (!token) return;

    // ค่าต้องตรงกับ ENUM ของ result_status ใน Health_Assessment (pass/fail/pending)
    const statusMap: Record<ResultLevel, string> = {
      green: 'pass',
      yellow: 'pending',
      red: 'fail',
    };

    // ✅ ใหม่: ส่งคำตอบรายข้อไปด้วย เพื่อให้เจ้าหน้าที่เปิดดูได้ (เก็บในคอลัมน์ result)
    const answers = this.questions.map((q) => ({
      id: q.id,
      question: q.question,
      answer: q.userAnswer,
      expected: q.expected,
      severity: q.severity,
      risky: q.userAnswer !== q.expected,
    }));

    const payload = {
      result_status: statusMap[this.resultLevel],
      assessment_date: new Date().toISOString(),
      answers,
      history: this.donorHistory,
    };

    fetch(environment.apiUrl + '/api/health-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          // เช่น 403 กรณีบัญชี Google ยังกรอกโปรไฟล์ไม่ครบ (backend กันไว้อีกชั้น)
          const body = await res.json().catch(() => ({}));
          alert(body.message || 'บันทึกผลแบบประเมินไม่สำเร็จ');
          if (res.status === 403) this.router.navigate([this.profilePath]);
          return;
        }
        console.log('บันทึก Health_Assessment สำเร็จ');
      })
      .catch((err) => {
        console.error('บันทึกไม่สำเร็จ', err);
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
    this.scoreEarned = 0;
    this.scoreMax = 0;
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
