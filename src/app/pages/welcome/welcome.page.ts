import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss']
})
export class WelcomePage {

  showLoginNotice = false;
  constructor(private router: Router) { }
  features = [
    {
      icon: 'medkit',
      color: 'primary',
      title: 'Expert Doctors',
      desc: 'Connect with qualified doctors instantly'
    },
    {
      icon: 'heart-circle',
      color: 'danger',
      title: 'Skilled Nurses',
      desc: 'Professional nursing care at your service'
    },
    {
      icon: 'fitness',
      color: 'success',
      title: 'Physiotherapy',
      desc: 'Specialized physical therapy sessions'
    },
    {
      icon: 'calendar',
      color: 'warning',
      title: 'Easy Booking',
      desc: 'Book appointments in seconds'
    },
  ];

  stats = [
    { value: '500+', label: 'Doctors' },
    { value: '10k+', label: 'Patients' },
    { value: '50+', label: 'Specialists' },
    { value: '24/7', label: 'Support' },
  ];

  goToProtected(route: string) {
    this.showLoginNotice = true;
    setTimeout(() => {
      this.showLoginNotice = false;
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: route }
      });
    }, 1500);
  }
}