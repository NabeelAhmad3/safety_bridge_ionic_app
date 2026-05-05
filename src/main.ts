import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular, IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { addIcons } from 'ionicons';
import {
  trashOutline, pencilOutline, saveOutline, closeOutline,
  personCircle, medkit, fitness, calendarOutline,
  timeOutline, checkmarkCircleOutline, medical, calendar,
  shieldCheckmark, statsChart, people, searchOutline,
  personCircleOutline, logOutOutline, heartCircle, mailOutline,
  personOutline, homeOutline, callOutline, lockClosedOutline,
  medicalOutline, logInOutline, personAddOutline, heart, time,
  lockClosed, flask, reloadOutline, flaskOutline, checkmarkOutline,
  addCircleOutline, receiptOutline, medkitOutline, bagOutline,
  bagCheckOutline, createOutline, documentText, documentTextOutline,
  eyeOutline, chatbubbleEllipses, chatbubbleEllipsesOutline,
  chatbubblesOutline, arrowBackOutline, peopleOutline,
  chatbubbleOutline, send, happyOutline, bag
} from 'ionicons/icons';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(IonicModule.forRoot()),  // ADD THIS LINE
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
});

addIcons({
  'trash-outline': trashOutline,
  'pencil-outline': pencilOutline,
  'save-outline': saveOutline,
  'close-outline': closeOutline,
  'person-circle': personCircle,
  'medkit': medkit,
  'fitness': fitness,
  'calendar-outline': calendarOutline,
  'time-outline': timeOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'medical': medical,
  'calendar': calendar,
  'shield-checkmark': shieldCheckmark,
  'stats-chart': statsChart,
  'people': people,
  'search-outline': searchOutline,
  'person-circle-outline': personCircleOutline,
  'log-out-outline': logOutOutline,
  'heart-circle': heartCircle,
  'mail-outline': mailOutline,
  'person-outline': personOutline,
  'home-outline': homeOutline,
  'call-outline': callOutline,
  'lock-closed-outline': lockClosedOutline,
  'medical-outline': medicalOutline,
  'log-in-outline': logInOutline,
  'person-add-outline': personAddOutline,
  'heart': heart,
  'time': time,
  'lock-closed': lockClosed,
  'flask': flask,
  'reload-outline': reloadOutline,
  'flask-outline': flaskOutline,
  'checkmark-outline': checkmarkOutline,
  'add-circle-outline': addCircleOutline,
  'receipt-outline': receiptOutline,
  'medkit-outline': medkitOutline,
  'bag-outline': bagOutline,
  'bag-check-outline': bagCheckOutline,
  'create-outline': createOutline,
  'document-text': documentText,
  'document-text-outline': documentTextOutline,
  'eye-outline': eyeOutline,
  'chatbubble-ellipses': chatbubbleEllipses,
  'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
  'chatbubbles-outline': chatbubblesOutline,
  'arrow-back-outline': arrowBackOutline,
  'people-outline': peopleOutline,
  'chatbubble-outline': chatbubbleOutline,
  'send': send,
  'happy-outline': happyOutline,
  'bag': bag
});