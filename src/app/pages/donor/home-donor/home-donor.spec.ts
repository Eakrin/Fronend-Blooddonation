import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDonor } from './home-donor';

describe('HomeDonor', () => {
  let component: HomeDonor;
  let fixture: ComponentFixture<HomeDonor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeDonor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDonor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
