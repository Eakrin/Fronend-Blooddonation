import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationDay } from './donation-day';

describe('DonationDay', () => {
  let component: DonationDay;
  let fixture: ComponentFixture<DonationDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationDay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
