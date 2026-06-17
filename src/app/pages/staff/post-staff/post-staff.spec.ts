import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostStaff } from './post-staff';

describe('PostStaff', () => {
  let component: PostStaff;
  let fixture: ComponentFixture<PostStaff>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostStaff]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostStaff);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
