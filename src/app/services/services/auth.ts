import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser$ = user(this.auth);

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

  async register(email: string, password: string, name: string, role: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await setDoc(doc(this.firestore, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      role,  // 'patient' | 'doctor' | 'physiotherapist' | 'nurse'
      createdAt: new Date()
    });
    return cred;
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  async getUserProfile(uid: string) {
    const snap = await getDoc(doc(this.firestore, 'users', uid));
    return snap.exists() ? snap.data() : null;
  }
}