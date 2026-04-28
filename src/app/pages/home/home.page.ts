import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/services/auth';
import { FirestoreService } from '../../services/services/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit {
  profile: any = null;
  appointments: any[] = [];
  upcomingCount = 0;
  completedCount = 0;
  pendingCount = 0;

  quickActions = [
    { title: 'Find Doctor',       icon: 'medical',          route: '/doctors',     color: 'primary'  },
    { title: 'Physiotherapist',   icon: 'fitness',          route: '/doctors',     color: 'tertiary' },
    { title: 'My Appointments',   icon: 'calendar',         route: '/appointment', color: 'success'  },
    { title: 'My Profile',        icon: 'person-circle',    route: '/profile',     color: 'warning'  },
  ];

  healthTips = [
    { tip: '💧 Drink at least 8 glasses of water daily.' },
    { tip: '🚶 Walk 30 minutes every day for better health.' },
    { tip: '😴 Get 7-8 hours of sleep each night.' },
    { tip: '🥦 Eat more vegetables and fruits daily.' },
  ];

  constructor(
    private auth: Auth,
    private authService: AuthService,
    private fs: FirestoreService
  ) {}

  ngOnInit() {
    this.auth.onAuthStateChanged(async user => {
      if (user) {
        this.profile = await this.authService.getUserProfile(user.uid);
        this.fs.getPatientAppointments(user.uid).subscribe(appts => {
          this.appointments = appts.slice(0, 3); // latest 3
          this.pendingCount   = appts.filter(a => a.status === 'pending').length;
          this.completedCount = appts.filter(a => a.status === 'completed').length;
          this.upcomingCount  = appts.filter(a => a.status === 'pending').length;
        });
      }
    });
  }
}