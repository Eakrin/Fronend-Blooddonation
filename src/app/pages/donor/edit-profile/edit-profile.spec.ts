import { ComponentFixture, TestBed } from '@angular/core/testing';

// ✅ แก้ไขตรงนี้ให้ชี้ไปยังไฟล์คอมโพเนนต์ที่ถูกต้อง
import { EditProfileComponent } from './edit-profile';

describe('EditProfileComponent', () => { // 💡 เปลี่ยนชื่อข้อความจำลองให้ตรงกับคลาสเพื่อความสอดคล้อง
  let component: EditProfileComponent;
  let fixture: ComponentFixture<EditProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
