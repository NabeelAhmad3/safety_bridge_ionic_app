import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/services/auth';
import { FirestoreService } from '../../services/services/firestore';
import { TestFilterPipe } from 'src/app/pipes-pipe';

@Component({
  selector: 'app-lab-tests',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, TestFilterPipe],
  templateUrl: './lab-tests.page.html',
  styleUrls: ['./lab-tests.page.scss']
})
export class LabTestsPage implements OnInit {

  userProfile: any = null;
  currentUser: any = null;

  labTests: any[] = [];
  showBookingForm = false;
  bookingLoading = false;
  bookingSuccess = false;
  bookingError = '';

  selectedTest = '';
  selectedDate = '';
  selectedTime = '';
  notes = '';

  allLabTests: any[] = [];
  filterStatus = 'all';
  editingTest: any = null;
  resultText = '';
  updatingStatus = '';

  get filteredAppointments() {
    if (this.filterStatus === 'all') return this.labTests;
    return this.labTests.filter(a => a.status === this.filterStatus);
  }


  availableTests = [
    { name: 'Complete Blood Count (CBC)', icon: 'water' },
    { name: 'Blood Glucose Test', icon: 'pulse' },
    { name: 'Liver Function Test', icon: 'fitness' },
    { name: 'Kidney Function Test', icon: 'medkit' },
    { name: 'Thyroid Function Test', icon: 'thermometer' },
    { name: 'Lipid Profile', icon: 'heart' },
    { name: 'Urine Analysis', icon: 'flask' },
    { name: 'X-Ray', icon: 'scan' },
    { name: 'ECG', icon: 'pulse' },
    { name: 'COVID-19 Test', icon: 'shield-checkmark' },
  ];

  get filteredTests() {
    if (this.filterStatus === 'all') return this.allLabTests;
    return this.allLabTests.filter(t => t.status === this.filterStatus);
  }

  get minDate() {
    return new Date().toISOString().split('T')[0];
  }

  constructor(
    private auth: Auth,
    private authService: AuthService,
    public fs: FirestoreService
  ) { }

  async ngOnInit() {
    this.auth.onAuthStateChanged(async user => {
      if (user) {
        this.currentUser = user;
        this.userProfile = await this.authService.getUserProfile(user.uid);
        if (this.userProfile?.role) {
          this.loadData();
        } else {
          console.error('❌ Role is missing from profile');
        }
      }
    });
  }

  loadData() {
    const role = this.userProfile?.role;
    const uid = this.currentUser?.uid;

    if (role === 'patient') {
      this.fs.getPatientLabTests(uid).subscribe(tests => {
        this.labTests = this.sortByDate(tests);
      });

    } else if (role === 'laboratory' || role === 'admin') {
      this.fs.getAllLabTests().subscribe({
        next: (tests) => {
          this.allLabTests = this.sortByDate(tests);
        },
        error: (err) => {
          console.error('❌ Error loading lab tests:', err);
        }
      });

    } else {
      console.warn('⚠️ Unknown role:', role);
    }
  }

  sortByDate(tests: any[]) {
    return tests.sort((a, b) => {
      const dA = a.createdAt?.toDate?.() || new Date(0);
      const dB = b.createdAt?.toDate?.() || new Date(0);
      return dB.getTime() - dA.getTime();
    });
  }

  async bookTest() {
    if (!this.selectedTest || !this.selectedDate || !this.selectedTime) return;
    this.bookingLoading = true;
    this.bookingError = '';
    try {
      await this.fs.bookLabTest({
        patientId: this.currentUser.uid,
        patientName: this.userProfile?.name || 'Patient',
        testName: this.selectedTest,
        date: this.selectedDate,
        time: this.selectedTime,
        notes: this.notes,
        status: 'pending'
      });
      this.bookingSuccess = true;
      this.selectedTest = '';
      this.selectedDate = '';
      this.selectedTime = '';
      this.notes = '';
      this.showBookingForm = false;
      setTimeout(() => this.bookingSuccess = false, 3000);
    } catch (e) {
      console.error(e);
      this.bookingError = '❌ Booking failed. Please try again.';
    } finally {
      this.bookingLoading = false;
    }
  }

  openEdit(test: any) {
    this.editingTest = { ...test };
    this.resultText = test.result || '';
    this.updatingStatus = test.status;
  }

  closeEdit() {
    this.editingTest = null;
    this.resultText = '';
    this.updatingStatus = '';
  }

  async saveResult() {
    if (!this.editingTest) return;
    try {
      await this.fs.updateLabTestStatus(
        this.editingTest.id,
        this.updatingStatus,
        this.resultText
      );
      this.closeEdit();
    } catch (e) {
      console.error('Update failed:', e);
    }
  }

  async startProcessing(testId: string) {
    if (!testId) { console.error('testId is missing'); return; }
    try {
      await this.fs.updateLabTestStatus(testId, 'processing');
    } catch (e) {
      console.error('Update failed:', e);
    }
  }

  async cancelTest(testId: string) {
    if (!testId) { console.error('testId is missing'); return; }
    try {
      await this.fs.updateLabTestStatus(testId, 'cancelled');
    } catch (e) {
      console.error('Cancel failed:', e);
    }
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }

  getTestIcon(testName: string) {
    const found = this.availableTests.find(t => t.name === testName);
    return found?.icon || 'flask';
  }
}