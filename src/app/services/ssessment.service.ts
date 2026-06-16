import { Injectable } from '@angular/core';

export interface QuizQuestion {
  id: number;
  step: number;
  question: string;
  expected: boolean;
  userAnswer: boolean | null;
}

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private evaluationResult: 'green' | 'orange' | 'red' = 'green';

  // คลังคำถามทั้งหมด 38 ข้อตามแบบฟอร์มสภากาชาดไทย
  private questions: QuizQuestion[] = [
    // --- ขั้นตอนที่ 1 (ความพร้อมและสุขภาพทั่วไป) ---
    {
      id: 1,
      step: 1,
      question: 'คุณรู้สึกสบายดี สุขภาพแข็งแรง พร้อมที่จะบริจาคโลหิตหรือไม่?',
      expected: true,
      userAnswer: null,
    },
    {
      id: 2,
      step: 1,
      question:
        'คุณนอนหลับพักผ่อนเพียงพอ (ไม่น้อยกว่า 5 ชั่วโมง) ในคืนที่ผ่านมาหรือไม่?',
      expected: true,
      userAnswer: null,
    },
    {
      id: 3,
      step: 1,
      question:
        'คุณรับประทานอาหารที่มีไขมันสูง ภายใน 6 ชั่วโมงที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 4,
      step: 1,
      question: 'คุณมีโรคประจำตัว หรือเคยเป็นโรคประจำตัวร้ายแรงหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 5,
      step: 1,
      question:
        'คุณรับประทานยาปฏิชีวนะ (ยาฆ่าเชื้อ) ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 6,
      step: 1,
      question:
        'คุณรับประทานยาแอสไพริน ยาคลายกล้ามเนื้อ หรือยาแก้ปวดข้อ ภายใน 2 วันที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 7,
      step: 1,
      question:
        'คุณมีการใช้ ยา หรือ สมุนไพร หรือ อาหารเสริม อื่นๆ เป็นประจำหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 8,
      step: 1,
      question: 'คุณดื่มแอลกอฮอล์ภายใน 24 ชั่วโมงที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 9,
      step: 1,
      question:
        'คุณเคยบริจาคเซลล์ต้นกำเนิดเม็ดโลหิต (กระแสโลหิต/ไขกระดูก) ในระยะ 6 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 10,
      step: 1,
      question:
        'คุณเคยตั้งครรภ์ หรือแท้งบุตร มาก่อนหรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      userAnswer: null,
    },
    {
      id: 11,
      step: 1,
      question:
        'คุณอยู่ในช่วงตั้งครรภ์ หรือให้นมบุตรอยู่หรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      userAnswer: null,
    },
    {
      id: 12,
      step: 1,
      question:
        'คุณคลอดบุตร หรือแท้งบุตร ภายใน 6 เดือนที่ผ่านมาหรือไม่? (ผู้ชายให้ตอบ ไม่ใช่)',
      expected: false,
      userAnswer: null,
    },

    // --- ขั้นตอนที่ 2 (ประวัติความเสี่ยงในระยะสั้นและหัตถการ) ---
    {
      id: 13,
      step: 2,
      question:
        'พฤติกรรมทางเพศ / เพศวิถี ของท่านในปัจจุบัน (เลือกข้อที่ตรงกับท่าน)',
      expected: true,
      userAnswer: null,
    },
    {
      id: 14,
      step: 2,
      question:
        'ท่านหรือคู่ของท่านเคยมีเพศสัมพันธ์กับผู้ที่ไม่ใช่คู่ของตน / ผู้บริการทางเพศ / ผู้เสพยาเสพติด หรือผู้ติดเชื้อเอชไอวีหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 15,
      step: 2,
      question:
        'คุณเคยใช้ยารักษาหรือป้องกันการติดเชื้อเอชไอวี (เช่น PEP หรือ PrEP) หรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 16,
      step: 2,
      question:
        'คุณเพิ่งอุดฟัน ขูดหินปูน (ภายใน 3 วัน) หรือถอนฟัน รักษารากฟัน (ภายใน 7 วัน) ที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 17,
      step: 2,
      question: 'คุณมีอาการท้องเสีย ท้องร่วง ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 18,
      step: 2,
      question:
        'คุณทำหัตถการเสริมความงามผ่านผิวหนัง เช่น เจาะหู สัก ลบสัก ฝังเข็ม ฉีดสารต่างๆ ภายใน 4 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 19,
      step: 2,
      question: 'คุณได้รับการผ่าตัดเล็ก ภายใน 7 วันที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 20,
      step: 2,
      question: 'คุณได้รับการผ่าตัดใหญ่ ภายใน 6 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 21,
      step: 2,
      question:
        'คุณเจ็บป่วยและได้รับโลหิต หรือส่วนประกอบโลหิตจากผู้อื่น ภายใน 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 22,
      step: 2,
      question:
        'คุณเคยได้รับการปลูกถ่ายอวัยวะ หรือเซลล์ต้นกำเนิดเม็ดโลหิตมาก่อนหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 23,
      step: 2,
      question: 'คุณเคยถูกเข็มที่เปื้อนเลือดตำ ในระยะ 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },

    // --- ขั้นตอนที่ 3 (โรคประจำตัวร้ายแรงและประวัติพื้นที่เสี่ยง) ---
    {
      id: 24,
      step: 3,
      question: 'คุณเคยป่วยเป็นโรคตับอักเสบ หลังอายุ 11 ปีหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 25,
      step: 3,
      question:
        'คู่ของท่านหรือบุคคลในครอบครัว เป็นโรคตับอักเสบ ในระยะเวลา 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 26,
      step: 3,
      question: 'คุณเคยตรวจพบว่าเป็นพาหะของโรคตับอักเสบหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 27,
      step: 3,
      question: 'คุณเคยป่วยเป็นโรคมาลาเรีย ในระยะ 3 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 28,
      step: 3,
      question:
        'คุณเคยเข้าไปในพื้นที่มีเชื้อมาลาเรียชุกชุม ในระยะ 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 29,
      step: 3,
      question:
        'คุณเคยป่วยเป็นไข้หวัดใหญ่ / ไข้เลือดออก / ชิคุนกุนยา / ไข้ซิกา / โควิด-19 ในระยะ 1 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 30,
      step: 3,
      question: 'คุณได้รับวัคซีนเพื่อป้องกันโรคในระยะ 2 เดือนที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 31,
      step: 3,
      question:
        'คุณได้รับเซรุ่ม (เช่น เซรุ่มพิษสุนัขบ้า) ภายใน 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 32,
      step: 3,
      question: 'คุณเคยมีประวัติเสพยาเสพติด หรือใช้สารเสพติดให้โทษหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 33,
      step: 3,
      question:
        'คุณเคยถูกควบคุมตัวหรือจองจำในเรือนจำติดต่อกันเกิน 72 ชั่วโมง ในช่วง 1 ปีที่ผ่านมาหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 34,
      step: 3,
      question:
        'คุณเคยมีน้ำหนักลด มีไข้ มีต่อมน้ำเหลืองโตโดยไม่ทราบสาเหตุ ในระยะ 3 เดือน หรือเคยตรวจพบเชื้อ HIV หรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 35,
      step: 3,
      question:
        'ช่วง พ.ศ. 2523 - 2539 คุณเคยพำนักในสหราชอาณาจักร (อังกฤษ, สกอตแลนด์, เวลส์, ไอร์แลนด์เหนือ) สะสมรวมเกิน 3 เดือนหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 36,
      step: 3,
      question:
        'ช่วง พ.ศ. 2523 - 2544 คุณเคยพำนักในฝรั่งเศส หรือไอร์แลนด์ สะสมรวมเกิน 5 ปีหรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 37,
      step: 3,
      question:
        'คุณมีบาดแผลสด แผลติดเชื้อ หรือผื่นคันขึ้นตามร่างกายในขณะนี้หรือไม่?',
      expected: false,
      userAnswer: null,
    },
    {
      id: 38,
      step: 3,
      question:
        'คุณมั่นใจว่าโลหิตของท่านมีความปลอดภัยสูง และพร้อมส่งต่อเพื่อช่วยชีวิตผู้ป่วยหรือไม่?',
      expected: true,
      userAnswer: null,
    },
  ];

  constructor() {}

  // ส่งคำถามทั้งหมดให้หน้า Quiz เรียกใช้งาน
  getQuestions(): QuizQuestion[] {
    return this.questions;
  }

  // ตรวจคำตอบตามเกณฑ์ความปลอดภัยทางการแพทย์
  evaluateAnswers(): void {
    let isRed = false;
    for (const q of this.questions) {
      if (q.id === 13) continue; // ข้ามข้อเช็กพฤติกรรมทางเพศแบบหลายตัวเลือกไปก่อน

      if (q.userAnswer !== null && q.userAnswer !== q.expected) {
        isRed = true;
        break;
      }
    }
    this.evaluationResult = isRed ? 'red' : 'green';
    console.log('ผลการประเมินสุขภาพสุทธาเวช:', this.evaluationResult);
  }

  // ให้หน้าสรุปผลลัพธ์ (Result) มาดึงค่าไปใช้งาน
  getFinalResult() {
    return this.evaluationResult;
  }
}
