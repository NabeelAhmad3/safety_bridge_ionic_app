import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, doc, updateDoc, getDocs, deleteDoc } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(private firestore: Firestore) { }

  getAllUsers(): Observable<any[]> {
    const ref = collection(this.firestore, 'users');
    return collectionData(ref, { idField: 'id' });
  }

  getUsersByRole(role: string): Observable<any[]> {
    const ref = collection(this.firestore, 'users');
    const q = query(ref, where('role', '==', role));
    return collectionData(q, { idField: 'id' });
  }

  getDoctors(): Observable<any[]> {
    const ref = collection(this.firestore, 'users');
    const q = query(ref, where('role', '==', 'doctor'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((users: any[]) => users.map(u => ({ ...u, uid: u.uid || u.id })))
    );
  }
  getPhysiotherapists(): Observable<any[]> {
    return this.getUsersByRole('physiotherapist');
  }
  getNurses(): Observable<any[]> {
    return this.getUsersByRole('nurse');
  }
  bookAppointment(data: {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    date: string;
    time: string;
    type: string;
    status: string;
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

  getAllAppointments(): Observable<any[]> {
    const ref = collection(this.firestore, 'appointments');
    return collectionData(ref, { idField: 'id' });
  }

  async deleteAppointment(appointmentId: string, userRole: string): Promise<void> {
    if (userRole !== 'admin') {
      throw new Error('Only admin can delete appointments');
    }
    const ref = doc(this.firestore, 'appointments', appointmentId);
    await deleteDoc(ref);
  }

  async deleteUserFromFirestore(uid: string, userRole: string): Promise<void> {
    if (userRole !== 'admin') {
      throw new Error('Only admin can delete users');
    }
    const ref = doc(this.firestore, 'users', uid);
    await deleteDoc(ref);
  }

  async updateAppointmentStatus(appointmentId: string, status: string, userRole?: string): Promise<void> {
    if (userRole && userRole !== 'admin' && userRole !== 'doctor' && userRole !== 'physiotherapist') {
      throw new Error('Not authorized to update appointments');
    }
    const ref = doc(this.firestore, 'appointments', appointmentId);
    await updateDoc(ref, { status });
  }

  updateAppointmentDetails(appointmentId: string, data: Partial<{
    date: string; time: string; type: string; status: string;
  }>) {
    const ref = doc(this.firestore, 'appointments', appointmentId);
    return updateDoc(ref, data);
  }
  async checkAppointmentConflict(doctorId: string, date: string, time: string): Promise<boolean> {
    const ref = collection(this.firestore, 'appointments');
    const q = query(ref,
      where('doctorId', '==', doctorId),
      where('date', '==', date),
      where('status', '!=', 'cancelled')
    );

    const snapshot = await getDocs(q);

    const [bookedHour, bookedMin] = time.split(':').map(Number);
    const bookedTotalMins = bookedHour * 60 + bookedMin;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const [existingHour, existingMin] = data['time'].split(':').map(Number);
      const existingTotalMins = existingHour * 60 + existingMin;
      const diff = Math.abs(bookedTotalMins - existingTotalMins);
      if (diff < 20) {
        return true;
      }
    }
    return false;
  }

  async getBookedSlots(doctorId: string, date: string, allSlots: string[]): Promise<string[]> {
    const bookedSlots: string[] = [];
    for (const slot of allSlots) {
      const conflict = await this.checkAppointmentConflict(doctorId, date, slot);
      if (conflict) {
        bookedSlots.push(slot);
      }
    }
    return bookedSlots;
  }
  async deleteLabTest(testId: string, userRole: string): Promise<void> {
    if (userRole !== 'admin') throw new Error('Only admin can delete lab tests');
    const ref = doc(this.firestore, 'labTests', testId);
    await deleteDoc(ref);
  }
  bookLabTest(data: {
    patientId: string;
    patientName: string;
    testName: string;
    date: string;
    time: string;
    notes: string;
    status: string;
  }) {
    return addDoc(collection(this.firestore, 'labTests'), {
      ...data,
      createdAt: new Date()
    });
  }

  getPatientLabTests(patientId: string): Observable<any[]> {
    const ref = collection(this.firestore, 'labTests');
    const q = query(ref, where('patientId', '==', patientId));
    return collectionData(q, { idField: 'id' });
  }

  getAllLabTests(): Observable<any[]> {
    const ref = collection(this.firestore, 'labTests');
    return collectionData(ref, { idField: 'id' });
  }

  async updateLabTestStatus(
    testId: string,
    status: string,
    result?: string
  ): Promise<void> {
    if (!testId) {
      throw new Error('Test ID is required');
    }
    const ref = doc(this.firestore, 'labTests', testId);
    await updateDoc(ref, {
      status,
      ...(result ? { result } : {}),
      updatedAt: new Date()
    });
  }
}