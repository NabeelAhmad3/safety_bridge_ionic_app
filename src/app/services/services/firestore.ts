import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, doc, updateDoc, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  // ─── DOCTORS ───────────────────────────────────────────────
  getDoctors(): Observable<any[]> {
    const ref = collection(this.firestore, 'users');
    const q = query(ref, where('role', '==', 'doctor'));
    return collectionData(q, { idField: 'id' });
  }

  getPhysiotherapists(): Observable<any[]> {
    const ref = collection(this.firestore, 'users');
    const q = query(ref, where('role', '==', 'physiotherapist'));
    return collectionData(q, { idField: 'id' });
  }

  // ─── APPOINTMENTS ──────────────────────────────────────────
  bookAppointment(data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
    type: string;   // 'doctor' | 'physiotherapist'
    status: string; // 'pending'
  }) {
    return addDoc(collection(this.firestore, 'appointments'), {
      ...data,
      createdAt: new Date()
    });
  }

getPatientAppointments(patientId: string): Observable<any[]> {
  const ref = collection(this.firestore, 'appointments');
  const q = query(ref, where('patientId', '==', patientId));
  return collectionData(q, { idField: 'id' });
}

  getDoctorAppointments(doctorId: string): Observable<any[]> {
    const ref = collection(this.firestore, 'appointments');
    const q = query(ref, where('doctorId', '==', doctorId));
    return collectionData(q, { idField: 'id' });
  }

  updateAppointmentStatus(appointmentId: string, status: string) {
    const ref = doc(this.firestore, 'appointments', appointmentId);
    return updateDoc(ref, { status });
  }
}