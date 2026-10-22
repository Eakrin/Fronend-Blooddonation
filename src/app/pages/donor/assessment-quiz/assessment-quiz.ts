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

    const payload = {
      result_status: statusMap[this.resultLevel],
      assessment_date: new Date().toISOString(),
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
