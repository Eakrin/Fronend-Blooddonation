import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderDonor } from './header-donor';

describe('HeaderDonor', () => {
  let component: HeaderDonor;
  let fixture: ComponentFixture<HeaderDonor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderDonor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderDonor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
