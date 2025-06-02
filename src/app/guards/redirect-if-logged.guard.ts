import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';

export const redirectIfLoggedGuard: CanActivateFn = (route, state) => {

	const auth = inject(Auth);
  const router = inject(Router);


  return new Observable<boolean>((observer) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Ya hay sesión → redirigir al dashboard
        router.navigate(['/dashboard']);
        observer.next(false);
      } else {
        // No hay sesión → permitir acceso al login o register
        observer.next(true);
      }
      observer.complete();
      unsubscribe();
    });
  });
};
