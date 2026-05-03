import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, where, doc, updateDoc, getDocs, deleteDoc, setDoc } from '@angular/fire/firestore';
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

  getMedicines() {
    return collectionData(collection(this.firestore, 'medicines'), { idField: 'id' }) as Observable<any[]>;
  }

  addMedicine(medicine: any) {
    return addDoc(collection(this.firestore, 'medicines'), { ...medicine, createdAt: new Date() });
  }

  deleteMedicine(id: string) {
    return deleteDoc(doc(this.firestore, 'medicines', id));
  }

  getAllMedicineOrders() {
    return collectionData(collection(this.firestore, 'medicineOrders'), { idField: 'id' }) as Observable<any[]>;
  }

  getPatientMedicineOrders(patientId: string) {
    const q = query(collection(this.firestore, 'medicineOrders'), where('patientId', '==', patientId));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  placeMedicineOrder(order: any) {
    return addDoc(collection(this.firestore, 'medicineOrders'), order);
  }

  updateMedicineOrderStatus(orderId: string, status: string) {
    return updateDoc(doc(this.firestore, 'medicineOrders', orderId), { status });
  }
  updateMedicine(id: string, data: any) {
    return updateDoc(doc(this.firestore, 'medicines', id), { ...data, updatedAt: new Date() });
  }

  addMedicalRecord(record: any) {
    return addDoc(collection(this.firestore, 'medicalRecords'), record);
  }

  getPatientMedicalRecords(patientId: string) {
    return collectionData(
      collection(this.firestore, 'medicalRecords'),
      { idField: 'id' }
    ).pipe(
      map((records: any[]) =>
        records
          .filter(r => r.patientId === patientId)
          .sort((a, b) => {
            const dA = a.createdAt?.toDate?.() || new Date(0);
            const dB = b.createdAt?.toDate?.() || new Date(0);
            return dB.getTime() - dA.getTime();
          })
      )
    ) as Observable<any[]>;
  }

  getAllMedicalRecords() {
    return collectionData(
      collection(this.firestore, 'medicalRecords'),
      { idField: 'id' }
    ).pipe(
      map((records: any[]) =>
        records.sort((a, b) => {
          const dA = a.createdAt?.toDate?.() || new Date(0);
          const dB = b.createdAt?.toDate?.() || new Date(0);
          return dB.getTime() - dA.getTime();
        })
      )
    ) as Observable<any[]>;
  }

  getPatients() {
    const q = query(collection(this.firestore, 'users'), where('role', '==', 'patient'));
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  updateMedicalRecord(id: string, data: any) {
    return updateDoc(doc(this.firestore, 'medicalRecords', id), { ...data, updatedAt: new Date() });
  }

  deleteMedicalRecord(id: string) {
    return deleteDoc(doc(this.firestore, 'medicalRecords', id));
  }

  deleteMedicineOrder(id: string) {
    return deleteDoc(doc(this.firestore, 'medicineOrders', id));
  }
  getChatId(uid1: string, uid2: string): string {
    return [uid1, uid2].sort().join('_');
  }

  sendMessage(chatId: string, message: any) {
    return addDoc(
      collection(this.firestore, 'chats', chatId, 'messages'),
      { ...message, createdAt: new Date() }
    );
  }

  getMessages(chatId: string): Observable<any[]> {
    return collectionData(
      collection(this.firestore, 'chats', chatId, 'messages'),
      { idField: 'id' }
    ).pipe(
      map((msgs: any[]) => msgs.sort((a, b) => {
        const dA = a.createdAt?.toDate?.() || new Date(0);
        const dB = b.createdAt?.toDate?.() || new Date(0);
        return dA.getTime() - dB.getTime();
      }))
    ) as Observable<any[]>;
  }

  getUserChats(uid: string): Observable<any[]> {
    return collectionData(
      collection(this.firestore, 'chats'),
      { idField: 'id' }
    ).pipe(
      map((chats: any[]) => chats.filter(c => c.id.includes(uid)))
    ) as Observable<any[]>;
  }

  async createOrGetChat(currentUser: any, specialist: any) {
    const chatId = this.getChatId(currentUser.uid, specialist.uid || specialist.id);
    const chatRef = doc(this.firestore, 'chats', chatId);
    await setDoc(chatRef, {
      participants: [currentUser.uid, specialist.uid || specialist.id],
      participantNames: {
        [currentUser.uid]: currentUser.name,
        [specialist.uid || specialist.id]: specialist.name
      },
      participantRoles: {
        [currentUser.uid]: currentUser.role,
        [specialist.uid || specialist.id]: specialist.role
      },
      lastMessage: '',
      lastMessageTime: new Date(),
      updatedAt: new Date()
    }, { merge: true });
    return chatId;
  }

  async updateLastMessage(chatId: string, message: string) {
    return updateDoc(doc(this.firestore, 'chats', chatId), {
      lastMessage: message,
      lastMessageTime: new Date(),
      updatedAt: new Date()
    });
  }
}