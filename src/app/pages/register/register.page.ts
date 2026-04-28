import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule,RouterModule],
  templateUrl: './register.page.html'
})
export class RegisterPage {
  name = '';
  email = '';
  password = '';
  role = 'patient';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    this.loading = true;
    this.error = '';
    try {
      await this.auth.register(this.email, this.password, this.name, this.role);
      this.router.navigate(['/home']);
    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }
}