import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
 
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
import { provideToastr } from 'ngx-toastr'; 


bootstrapApplication(AppComponent, {
  providers: [
		provideRouter(routes), 
		provideHttpClient(),
		provideAnimations(), // required animations providers
		// ✅ Firebase providers
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
		provideStorage(() => getStorage()), // 👉 ESTA LÍNEA ES CLAVE
		provideToastr({
			positionClass: 'toast-bottom-right',
			timeOut: 3000,
			closeButton: true,
			progressBar: true,
		}) // <-- ✅ Esto registra Toastr globalmente
	],
}).catch((err) => console.error(err));
/* 
provideToastr({
  positionClass: 'toast-bottom-right',
  timeOut: 3000,
  closeButton: true,
  progressBar: true,
})


*/