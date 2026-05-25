import { Routes } from '@angular/router';

import { Home } from './pages/user_public/home/home';
import { Location } from './pages/user_public/location/location';
import { Contact } from './pages/user_public/contact/contact';

import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';

import { HomeDonor } from './pages/donor/home-donor/home-donor';
import { BookingComponent } from './pages/donor/booking/booking';


export const routes: Routes = [

  { path: '', component: Home },
  { path: 'location', component: Location },
  { path: 'contact', component: Contact },

  { path: 'login', component: Login },
  { path: 'register', component: Register },

  { path: 'home-donor', component: HomeDonor },
  { path: 'booking', component: BookingComponent }

];
