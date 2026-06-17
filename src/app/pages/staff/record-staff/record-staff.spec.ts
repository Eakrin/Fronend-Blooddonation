import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordStaff } from './record-staff';

describe('RecordStaff', () => {
  let component: RecordStaff;
  let fixture: ComponentFixture<RecordStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
