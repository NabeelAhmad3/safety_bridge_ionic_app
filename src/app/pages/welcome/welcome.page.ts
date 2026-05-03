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
      title: 'Expert Specialists',
      desc: 'Connect with qualified doctors, nurses and physiotherapists instantly'
    },
    {
      icon: 'flask',
      color: 'tertiary',
      title: 'Lab Tests',
      desc: 'Book professional lab tests and receive results online'
    },
    {
      icon: 'document-text',
      color: 'success',
      title: 'Health Records',
      desc: 'Access your complete medical history anytime, anywhere'
    },
    {
      icon: 'calendar',
      color: 'warning',
      title: 'Easy Booking',
      desc: 'Schedule appointments with specialists in just a few taps'
    },
    {
      icon: 'medkit',
      color: 'danger',
      title: 'Medicine Delivery',
      desc: 'Order prescribed medicines and track your deliveries'
    },
    {
      icon: 'chatbubble-ellipses',
      color: 'secondary',
      title: 'Online Consultation',
        desc: 'Chat directly with your doctor or specialist in real time'
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