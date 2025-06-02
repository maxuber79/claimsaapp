import { inject } from '@angular/core';
import { CanActivateFn , Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';


export const authGuard: CanActivateFn = (route, state) => {
	const auth = inject(Auth);
  const router = inject(Router);


 return new Observable<boolean>((observer) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Usuario autenticado, puede acceder
        observer.next(true);
      } else {
        // No autenticado, redirigir al login
        router.navigate(['/']);
        observer.next(false);
      }
      observer.complete();
      unsubscribe(); // detener escucha para evitar memoria
    });
  });
};
