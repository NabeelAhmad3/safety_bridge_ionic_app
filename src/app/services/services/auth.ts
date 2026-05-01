import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const snap = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));
        if (snap.exists()) {
          this.currentUserSubject.next({ uid: firebaseUser.uid, ...snap.data() });
        }
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async register(email: string, password: string, name: string, role: string, phone: string, address: string) {
    if (role === 'admin') throw new Error('Cannot register as admin');

    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await setDoc(doc(this.firestore, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name,
      email,
      role,
      phone,
      address,
      createdAt: new Date()
    });
    return cred;
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
  }

  async getUserProfile(uid: string) {
    const snap = await getDoc(doc(this.firestore, 'users', uid));
    return snap.exists() ? snap.data() : null;
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }
}