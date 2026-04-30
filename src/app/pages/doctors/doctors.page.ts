import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FirestoreService } from '../../services/services/firestore';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './doctors.page.html'
})
export class DoctorsPage implements OnInit {
  doctors: any[] = [];
  physiotherapists: any[] = [];
  nurses: any[] = [];
  segment = 'doctors';

  constructor(private fs: FirestoreService, private router: Router) { }

  ngOnInit() {
    this.fs.getDoctors().subscribe(d => this.doctors = d);
    this.fs.getPhysiotherapists().subscribe(p => this.physiotherapists = p);
    this.fs.getNurses().subscribe(n => this.nurses = n)
  }

  bookAppointment(specialist: any) {
    this.router.navigate(['/appointments'], { state: { specialist } });
  }
}