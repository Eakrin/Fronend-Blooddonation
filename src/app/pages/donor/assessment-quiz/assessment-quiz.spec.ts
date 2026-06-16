import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentQuiz } from './assessment-quiz';

describe('AssessmentQuiz', () => {
  let component: AssessmentQuiz;
  let fixture: ComponentFixture<AssessmentQuiz>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentQuiz]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentQuiz);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
