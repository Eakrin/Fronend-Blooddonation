import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarStaff } from './sidebar-staff';

describe('SidebarStaff', () => {
  let component: SidebarStaff;
  let fixture: ComponentFixture<SidebarStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
