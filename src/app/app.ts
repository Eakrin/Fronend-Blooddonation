import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { HeaderDonor } from './components/header-donor/header-donor';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, HeaderDonor, NgIf],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

}
