import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/services/auth';
import { filter, take } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './login.page.html'

})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  error = '';
  returnUrl = '/home';
  constructor(private auth: AuthService, private router: Router,
    private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  async login() {
    this.loading = true;
    this.error = '';
    try {
      await this.auth.login(this.email, this.password);

      this.auth.currentUser$.pipe(
        filter(user => user !== null),
        take(1)
      ).subscribe(user => {
        if (user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      });

    } catch (e: any) {
      this.error = e.message;
    } finally {
      this.loading = false;
    }
  }
}