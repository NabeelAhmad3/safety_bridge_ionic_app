import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/services/auth';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './profile.page.html'
})
export class ProfilePage implements OnInit {
  profile: any = null;

  constructor(private auth: Auth, private authService: AuthService) {}

  ngOnInit() {
    this.auth.onAuthStateChanged(async user => {
      if (user) {
        this.profile = await this.authService.getUserProfile(user.uid);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}