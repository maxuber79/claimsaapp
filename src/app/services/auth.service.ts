// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, UserCredential,sendPasswordResetEmail, authState } from '@angular/fire/auth';
import { onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { filter } from 'rxjs/operators';
/* Interfaces */
import { UserModel } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
	
	constructor(private auth: Auth) {
    console.log('%c<<< Start AUTH service >>>', 'background: #cff4fc; color: #055160; padding: 2px 5px;');
  }

	/**
   * 🔍 Retorna el observable del estado de autenticación del usuario
   * @returns Observable<User | null>
   */
  getAuthState(): Observable<User | null> {
    console.log('👁 Observando el estado de autenticación...');
    return authState(this.auth);
  }

	/**
   * 🔐 Devuelve el usuario actual (de tipo User), filtrando los valores null.
   * ✅ Esto asegura que los consumidores reciban solo usuarios válidos.
   */
  getCurrentUser(): Observable<User> {
    return this.getAuthState().pipe(
      filter((user): user is User => !!user) // filtra null y le dice a TypeScript que ahora es User
    );
  }


	/**
 * 🔐 Devuelve el UID del usuario autenticado si está logueado.
 */
/* 	getCurrentUser(): Observable<User> {
		return this.getAuthState().pipe(
			switchMap(user => {
				if (user) {
					return of(user); // Contiene el UID y más info
				} else {
					return throwError(() => new Error('No hay usuario autenticado.'));
				}
			})
		);
	} */

	

  /**
   * 🔐 Inicia sesión con email y password
   * @param email Email del usuario
   * @param password Contraseña del usuario
   * @returns Promesa con credencial del usuario autenticado
   */
  login(email: string, password: string): Promise<UserCredential> {
    console.log('🔐 Intentando iniciar sesión con:', email);
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * 🆕 Registra un nuevo usuario con email y password
   * @param email Email del nuevo usuario
   * @param password Contraseña
   * @returns Promesa con credencial del nuevo usuario
   */
  register(email: string, password: string): Promise<UserCredential> {
    console.log('📝 Registrando nuevo usuario con:', email);
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  /**
   * 🚪 Cierra sesión del usuario actual
   * @returns Promesa que se resuelve al cerrar sesión
   */
  logout(): Promise<void> {
    console.log('🚪 Cerrando sesión del usuario actual');
    return signOut(this.auth);
  }

	 /**
   * 🔁 Envia un correo para restablecer contraseña
   * @param email Correo del usuario
   * @returns Promesa que se resuelve al enviar el correo
   */
	 resetPassword(email: string): Promise<void> {
    console.log('📧 Enviando enlace de recuperación a:', email);
    return sendPasswordResetEmail(this.auth, email);
  }



	//Agregar esto mas rato
/* 	try {
		await signInWithEmailAndPassword(this.auth, email, password);
		// Redirección normal
	} catch (error: any) {
		if (error.code === 'auth/visibility-check-was-unavailable') {
			this.alertService.showToastError(
				'Hubo un problema con el servicio de autenticación. Por favor, recarga la página o inténtalo más tarde.',
				'Error de conexión'
			);
		} else {
			this.alertService.showToastError(
				this.firebaseService.getFriendlyMessage(error.code),
				'Error de login'
			);
		}
	} */
	
}
