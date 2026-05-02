import { Routes } from '@angular/router';
import { guestGuard } from './guards/guest-auth-guard';
import { authGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin-auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
    canActivate: [guestGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage),
    canActivate: [guestGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: 'doctors',
    loadComponent: () => import('./pages/doctors/doctors.page').then(m => m.DoctorsPage),
    canActivate: [authGuard]
  },
  {
    path: 'appointments',
    loadComponent: () => import('./pages/appointments/appointments.page').then(m => m.AppointmentsPage),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
    canActivate: [AdminGuard]
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then( m => m.WelcomePage)
  },
  {
    path: 'lab',
    loadComponent: () => import('./pages/lab-tests/lab-tests.page').then( m => m.LabTestsPage)
  },


];