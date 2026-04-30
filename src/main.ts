import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

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
  timeOutline,
  checkmarkCircleOutline,
  medical,
  calendar,
  shieldCheckmark,
  statsChart,
  people,
  searchOutline,
  personCircleOutline,
  logInOutline,
  logOutOutline,
  heartCircle,
  mailOutline,
  personOutline
} from 'ionicons/icons';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    provideIonicAngular(),

    provideRouter(routes, withPreloading(PreloadAllModules)),

    // FIREBASE SETUP 
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
'medical':medical,
'calendar':calendar,
'shield-checkmark': shieldCheckmark,
'stats-chart': statsChart,
'people': people,
'search-outline':searchOutline,
'person-circle-outline':personCircleOutline,
'log-out-outline':logOutOutline,
'heart-circle':heartCircle,
'mail-outline':mailOutline,
'person-outline':personOutline,
});