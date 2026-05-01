import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FirestoreService } from '../../services/services/firestore';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss']
})
export class AdminPage implements OnInit {
  segment = 'appointments';
  allAppointments: any[] = [];
  patients: any[] = [];
  doctors: any[] = [];
  physiotherapists: any[] = [];
  editingAppt: any = null;
  selectedStatus = '';
  adminRole = 'admin';
  adminProfile: any = null;
  nurses: any[] = [];

  get totalAppointments() { return this.allAppointments.length; }
  get pendingCount() { return this.allAppointments.filter(a => a.status === 'pending').length; }
  get confirmedCount() { return this.allAppointments.filter(a => a.status === 'confirmed').length; }
  get completedCount() { return this.allAppointments.filter(a => a.status === 'completed').length; }
  get allStaff() { return [...this.doctors, ...this.physiotherapists, ...this.nurses]; }

  constructor(private fs: FirestoreService, private authService: AuthService) { }

  ngOnInit() {

    this.adminProfile = this.authService.getCurrentUser();
    this.fs.getAllAppointments().subscribe(a => {
      this.allAppointments = a.sort((x: any, y: any) => {
        const dA = x.createdAt?.toDate?.() || new Date(0);
        const dB = y.createdAt?.toDate?.() || new Date(0);
        return dB.getTime() - dA.getTime();
      });
    });
    this.fs.getUsersByRole('patient').subscribe(p => this.patients = p);
    this.fs.getUsersByRole('doctor').subscribe(d => this.doctors = d);
    this.fs.getUsersByRole('physiotherapist').subscribe(p => this.physiotherapists = p);
    this.fs.getUsersByRole('nurse').subscribe(n => this.nurses = n)
  }

  openEdit(appt: any) {
    this.editingAppt = { ...appt };
    this.selectedStatus = appt.status;
  }

  closeEdit() {
    this.editingAppt = null;
    this.selectedStatus = '';
  }


  async deleteAppointment(id: string) {
    if (!id) return;
    if (confirm('Delete this appointment?')) {
      try {
        await this.fs.deleteAppointment(id, this.adminRole);
        console.log('✅ Deleted');
      } catch (e) {
        console.error('❌ Delete failed:', e);
      }
    }
  }

  async deleteUser(uid: string) {
    if (!uid) return;
    if (confirm('Delete this user?')) {
      try {
        await this.fs.deleteUserFromFirestore(uid, this.adminRole);
        console.log('✅ User deleted');
      } catch (e) {
        console.error('❌ Delete failed:', e);
      }
    }
  }

  async saveEdit() {
    if (!this.editingAppt || !this.selectedStatus) return;
    try {
      await this.fs.updateAppointmentStatus(
        this.editingAppt.id,
        this.selectedStatus,
        this.adminRole
      );
      this.closeEdit();
    } catch (e) {
      console.error('❌ Update failed:', e);
    }
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

 getRoleIcon(role: string) {
    switch (role) {
      case 'doctor': return 'medkit';
      case 'physiotherapist': return 'fitness';
      case 'nurse': return 'heart-circle';
      default: return 'person-circle';
    }
  }

  getRoleColor(role: string) {
    switch (role) {
      case 'doctor': return 'tertiary';
      case 'physiotherapist': return 'secondary';
      case 'nurse': return 'success';
      default: return 'medium';
    }
  }
  async logout() {
    await this.authService.logout();
  }

}