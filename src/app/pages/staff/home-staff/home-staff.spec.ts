import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeStaff } from './home-staff';

describe('HomeStaff', () => {
  let component: HomeStaff;
  let fixture: ComponentFixture<HomeStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
