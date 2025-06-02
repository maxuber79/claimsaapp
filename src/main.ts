import { bootstrapApplication } from '@angular/platform-browser';

 
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { environment } from './environments/environment';
// 🧩 Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; 
import { provideStorage, getStorage } from '@angular/fire/storage';


bootstrapApplication(AppComponent, {
  providers: [
		provideRouter(routes), 
		provideHttpClient(),
		// ✅ Firebase providers
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
		provideStorage(() => getStorage()) // 👉 ESTA LÍNEA ES CLAVE
	],
}).catch((err) => console.error(err));
