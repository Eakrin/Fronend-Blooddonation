import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileStaff } from './profile-staff';

describe('ProfileStaff', () => {
  let component: ProfileStaff;
  let fixture: ComponentFixture<ProfileStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
