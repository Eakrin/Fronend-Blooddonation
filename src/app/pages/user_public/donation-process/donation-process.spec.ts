import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DonationProcess } from './donation-process';

describe('DonationProcess', () => {
  let component: DonationProcess;
  let fixture: ComponentFixture<DonationProcess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonationProcess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonationProcess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
