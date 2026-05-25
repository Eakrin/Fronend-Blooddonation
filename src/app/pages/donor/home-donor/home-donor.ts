import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-donor',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-donor.html',
  styleUrl: './home-donor.css'
})
export class HomeDonor implements OnInit {

  userName = '';
  bloodPressure = '-';
  hemoglobin = '-';

  ngOnInit() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.userName = parsed.name + ' ' + (parsed.lastname || '');
    }
  }

}
