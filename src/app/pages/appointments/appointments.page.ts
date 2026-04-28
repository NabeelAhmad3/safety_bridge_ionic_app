import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { FirestoreService } from '../../services/services/firestore';
import { AuthService } from '../../services/services/auth';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './appointments.page.html'
})
export class AppointmentsPage implements OnInit {
  specialist: any = null;
  date = '';
  time = '';
  loading = false;
  success = false;
  appointments: any[] = [];
  currentUser: any = null;
  userProfile: any = null;

  constructor(
    private router: Router,
    private auth: Auth,
    private authService: AuthService,
    private fs: FirestoreService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.specialist = nav?.extras?.state?.['specialist'] || null;
  }

  async ngOnInit() {
    this.auth.onAuthStateChanged(async user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = await this.authService.getUserProfile(user.uid);
        this.fs.getPatientAppointments(user.uid).subscribe(a => this.appointments = a);
      }
    });
  }

  async book() {
    if (!this.date || !this.time || !this.specialist) return;
    this.loading = true;
    try {
      await this.fs.bookAppointment({
        patientId: this.currentUser.uid,
        patientName: this.userProfile?.name || 'Patient',
        doctorId: this.specialist.uid,
        doctorName: this.specialist.name,
        date: this.date,
        time: this.time,
        type: this.specialist.role,
        status: 'pending'
      });
      this.success = true;
      this.date = '';
      this.time = '';
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}