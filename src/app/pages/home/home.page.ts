import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../services/services/auth';
import { FirestoreService } from '../../services/services/firestore';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tipsContainer', { static: false }) tipsContainer!: ElementRef;

  private scrollInterval: any;
  profile: any = null;
  appointments: any[] = [];
  confirmCount = 0;
  completedCount = 0;
  pendingCount = 0;
  quickActions: any[] = [];
  searchQuery = '';
  allSpecialists: any[] = [];
  filteredSpecialists: any[] = [];
  isSearching = false;
  recentLabTests: any[] = [];
  labPendingCount = 0;
  labProcessingCount = 0;
  labCompletedCount = 0;
  patientLabTests: any[] = [];
  labPatientPendingCount = 0;
  labPatientCompletedCount = 0;


  allQuickActions = [
    { title: 'Find Specialists', icon: 'medical', route: '/doctors', color: 'primary', roles: ['patient'] },
    { title: 'Book Lab Test', icon: 'flask', route: '/lab', color: 'tertiary', roles: ['patient'] },
    { title: 'My Appointments', icon: 'calendar', route: '/appointments', color: 'success', roles: ['patient', 'doctor', 'physiotherapist', 'nurse'] },
    { title: 'Lab Requests', icon: 'flask', route: '/lab', color: 'tertiary', roles: ['laboratory'] },
    { title: 'My Profile', icon: 'person-circle', route: '/profile', color: 'warning', roles: ['patient', 'doctor', 'physiotherapist', 'nurse', 'laboratory'] },
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
    private fs: FirestoreService,
    private router: Router
  ) { }
  ngAfterViewInit() {
    this.startAutoScroll();
  }
  startAutoScroll() {
    this.stopAutoScroll();
    if (!this.tipsContainer) return;

    const container = this.tipsContainer.nativeElement;

    this.scrollInterval = setInterval(() => {

      container.scrollBy({
        left: container.clientWidth,
        behavior: 'smooth'
      });

      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 5) {
        container.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      }

    }, 3000);
  }

  stopAutoScroll() {
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }
  async ngOnInit() {
    this.auth.onAuthStateChanged(async user => {
      if (user) {
        this.profile = await this.authService.getUserProfile(user.uid);

        this.quickActions = this.allQuickActions.filter(a =>
          a.roles.includes(this.profile?.role)
        );

        if (this.profile?.role === 'admin') {
          this.router.navigate(['/admin']);
          return;
        }

        if (this.profile?.role === 'patient') {
          this.loadSpecialists();
        }

        const role = this.profile?.role;
        if (this.profile?.role === 'patient') {
          this.loadSpecialists();
          this.fs.getPatientLabTests(user.uid).subscribe(tests => {
            const sorted = [...tests].sort((a, b) => {
              const dA = a.createdAt?.toDate?.() || new Date(0);
              const dB = b.createdAt?.toDate?.() || new Date(0);
              return dB.getTime() - dA.getTime();
            });
            this.patientLabTests = sorted.slice(0, 3);
            this.labPatientPendingCount = tests.filter(t => t.status === 'pending').length;
            this.labPatientCompletedCount = tests.filter(t => t.status === 'completed').length;
          });
        }
        if (role === 'laboratory') {
          this.fs.getAllLabTests().subscribe({
            next: (tests) => {
              const sorted = tests.sort((a, b) => {
                const dA = a.createdAt?.toDate?.() || new Date(0);
                const dB = b.createdAt?.toDate?.() || new Date(0);
                return dB.getTime() - dA.getTime();
              });
              this.recentLabTests = sorted.slice(0, 3);
              this.labPendingCount = sorted.filter(t => t.status === 'pending').length;
              this.labProcessingCount = sorted.filter(t => t.status === 'processing').length;
              this.labCompletedCount = sorted.filter(t => t.status === 'completed').length;

            },
            error: (err) => {
              console.error('❌ Error loading lab tests:', err);
            }
          });
          return;
        }

        const appts$ = (role === 'doctor' || role === 'physiotherapist' || role === 'nurse')
          ? this.fs.getDoctorAppointments(user.uid)
          : this.fs.getPatientAppointments(user.uid);

        appts$.subscribe(appts => {
          const sorted = appts.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          this.appointments = sorted.slice(0, 3);
          this.pendingCount = sorted.filter(a => a.status === 'pending').length;
          this.completedCount = sorted.filter(a => a.status === 'completed').length;
          this.confirmCount = sorted.filter(a => a.status === 'confirmed').length;
        });
      }
    });
  }

  loadSpecialists() {
    this.fs.getDoctors().subscribe(doctors => {
      const d = doctors.map(x => ({ ...x, uid: x.uid || x.id, roleLabel: 'Doctor' }));
      this.fs.getPhysiotherapists().subscribe(physios => {
        const p = physios.map(x => ({ ...x, uid: x.uid || x.id, roleLabel: 'Physiotherapist' }));
        this.fs.getNurses().subscribe(nurses => {
          const n = nurses.map(x => ({ ...x, uid: x.uid || x.id, roleLabel: 'Nurse' }));
          this.allSpecialists = [...d, ...p, ...n];
        });
      });
    });
  }

  onSearch() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.isSearching = false;
      this.filteredSpecialists = [];
      return;
    }
    this.isSearching = true;
    this.filteredSpecialists = this.allSpecialists.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.roleLabel?.toLowerCase().includes(q) ||
      s.specialization?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  }

  clearSearch() {
    this.searchQuery = '';
    this.isSearching = false;
    this.filteredSpecialists = [];
  }

  bookSpecialist(specialist: any) {
    this.router.navigate(['/appointments'], { state: { specialist } });
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
  getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  }
}