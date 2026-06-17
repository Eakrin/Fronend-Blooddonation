import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationStaff } from './location-staff';

describe('LocationStaff', () => {
  let component: LocationStaff;
  let fixture: ComponentFixture<LocationStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
