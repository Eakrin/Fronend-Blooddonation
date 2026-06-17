import { Routes } from '@angular/router';

import { Home } from './pages/user_public/home/home';
import { Location } from './pages/user_public/location/location';
import { Contact } from './pages/user_public/contact/contact';

import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';

import { HomeDonor } from './pages/donor/home-donor/home-donor';
import { BookingComponent } from './pages/donor/booking/booking';
import { EditProfileComponent } from './pages/donor/edit-profile/edit-profile';
import { AssessmentQuiz } from './pages/donor/assessment-quiz/assessment-quiz';
import { ManageAccounts } from './pages/admin/manage-accounts/manage-accounts';
import { HomeAdmin } from './pages/admin/home-admin/home-admin';
import { Settings } from './pages/admin/settings/settings';
import { profileAdmin } from './pages/admin/profile-admin/profile-admin';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'location', component: Location },
  { path: 'contact', component: Contact },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'home-donor', component: HomeDonor },
  { path: 'booking', component: BookingComponent },
  { path: 'edit-profile', component: EditProfileComponent },
  { path: 'assessment-quiz', component: AssessmentQuiz },

  // โซนของ Admin (ปรับแก้ให้ตรงสิทธิ์)
  { path: 'home-admin', component: HomeAdmin }, // 👈 2. แก้ให้วิ่งไปที่หน้าหลักของแอดมินก่อน
  { path: 'manage-accounts', component: ManageAccounts }, // 👈 3. ส่วนหน้านี้เอาไว้กดลิงก์ไปทีหลังเมื่อล็อกอินเข้าหน้าหลักแล้ว
  { path: 'settings', component: Settings }, // 👈 4. ส่วนหน้านี้เอาไว้กดลิงก์ไปทีหลังเมื่อล็อกอินเข้าหน้าหลักแล้ว
  { path: 'profile-admin', component: profileAdmin },
];
