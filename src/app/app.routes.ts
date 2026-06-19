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
import { HomeStaff } from './pages/staff/home-staff/home-staff';

import { PostStaff } from './pages/staff/post-staff/post-staff';
import { DonationDay } from './pages/staff/donation-day/donation-day';
import { ProfileStaff } from './pages/staff/profile-staff/profile-staff';
import { RecordStaff } from './pages/staff/record-staff/record-staff';
import { LocationStaff } from './pages/staff/location-staff/location-staff';
import { BookingHistory } from './pages/donor/booking-history/booking-history';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'location', component: Location },
  { path: 'contact', component: Contact },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // โซนของ Donor
  { path: 'home-donor', component: HomeDonor },
  { path: 'booking', component: BookingComponent },
  { path: 'edit-profile', component: EditProfileComponent },
  { path: 'assessment-quiz', component: AssessmentQuiz },
  { path: 'booking-history', component: BookingHistory },

  // โซนของ Admin (ปรับแก้ให้ตรงสิทธิ์)
  { path: 'home-admin', component: HomeAdmin }, // 👈 2. แก้ให้วิ่งไปที่หน้าหลักของแอดมินก่อน
  { path: 'manage-accounts', component: ManageAccounts }, // 👈 3. ส่วนหน้านี้เอาไว้กดลิงก์ไปทีหลังเมื่อล็อกอินเข้าหน้าหลักแล้ว
  { path: 'settings', component: Settings }, // 👈 4. ส่วนหน้านี้เอาไว้กดลิงก์ไปทีหลังเมื่อล็อกอินเข้าหน้าหลักแล้ว
  { path: 'profile-admin', component: profileAdmin },

  // โซนของ Staff
  { path: 'home-staff', component: HomeStaff },
  { path: 'post-staff', component: PostStaff },
  { path: 'donation-day-staff', component: DonationDay },
  { path: 'profile-staff', component: ProfileStaff },
  { path: 'record-staff', component: RecordStaff },
  { path: 'location-staff', component: LocationStaff },
];
