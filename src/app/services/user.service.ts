import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, collectionData, docData, updateDoc, deleteDoc } from '@angular/fire/firestore'; 
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

/* Interfaces */
import { UserModel } from '../models/user';
/* Servicios */
import { AuthService } from './auth.service';


 


@Injectable({
  providedIn: 'root'
})
export class UserService {
	
	// La colección para los perfiles de usuario. Típicamente se llama 'users' o 'profiles'.
  // Asumiremos que el ID del documento en Firestore es el mismo que el 'uid' del usuario.
  private usersCollectionName = 'users';



  constructor( private http: HttpClient, private authService: AuthService, private firestore: Firestore ) {
		console.log('%c<<< Start USER service >>>','background: #fff3cd; color: #664d03; padding: 2px 5px;');
	}


	/**
   * 🔍 Obtener los datos de un usuario desde Firestore como Observable
   * @param uid ID del usuario (auth.uid)
   * @returns Observable<UserModel>
   */
	 /**
   * 🔍 Obtiene el perfil de un usuario por su UID desde Firestore.
   * @param uid - ID del usuario
   * @returns Observable con los datos del usuario o undefined
   */
	 getUserProfile(uid: string): Observable<UserModel | undefined> {
    if (!uid) {
      console.warn('⚠️ getUserProfile: UID no proporcionado.');
      return of(undefined);
    }
    const userRef = doc(this.firestore, `${this.usersCollectionName}/${uid}`);
    console.log('📄 Obteniendo perfil para UID:', uid);
    return docData(userRef).pipe(
      map(user => {
        if (user) {
          console.log('✅ Perfil obtenido:', user);
          return { ...user, uid } as UserModel;
        }
        console.warn('⚠️ No se encontró perfil para UID:', uid);
        return undefined;
      }),
      catchError(error => {
        console.error('❌ Error al obtener el perfil del usuario:', error);
        return of(undefined);
      })
    );
  }

	 
	
		/* 
		getUserProfile(uid: string): Observable<UserModel | undefined> {
    if (!uid) {
      console.warn('getUserProfile: UID no proporcionado.');
      return of(undefined);
    }
    const userRef = doc(this.firestore, `${this.usersCollectionName}/${uid}`);
    return docData(userRef).pipe(
      map(user => user ? { ...user, uid } as UserModel : undefined),
      catchError(error => {
        console.error('Error al obtener el perfil del usuario:', error);
        return of(undefined);
      })
    );
  }
		
		
		*/
	
  /* getUserProfile(uid: string): Observable<UserModel | undefined> {
    if (!uid) {
      console.warn('getUserProfile: UID no proporcionado.');
      return of(undefined); // Retorna un Observable que emite undefined inmediatamente
    }
    return this.afs.collection<UserModel>(this.usersCollectionName).doc<UserModel>(uid).valueChanges().pipe(
      map(user => {
        if (user) {
          // Asegúrate de que el 'uid' esté presente en el objeto retornado
          return { ...user, uid: uid };
        }
        return undefined;
      }),
      catchError(error => {
        console.error('Error al obtener el perfil del usuario:', error);
        return of(undefined); // Manejo de errores: retorna undefined en caso de fallo
      })
    );
  } */

	/**
   * 🆕 Crea un nuevo perfil de usuario en Firestore.
   * @param user - Objeto con datos del usuario
   * @returns Observable que se completa al crear el documento
   */
	createUserProfile(user: UserModel): Observable<void> {
    if (!user.uid) {
      return from(Promise.reject('❌ createUserProfile: UID del usuario es requerido.'));
    }
    const now = new Date();
    const userToCreate: UserModel = {
      ...user,
      created_at: now as any,
      createdDate: now,
    };
    const userRef = doc(this.firestore, `${this.usersCollectionName}/${user.uid}`);
    console.log('📝 Creando perfil para usuario:', userToCreate);
    return from(setDoc(userRef, userToCreate));
  }

  /**
   * ✏️ Actualiza el perfil de un usuario existente en Firestore.
   * @param uid - ID del usuario
   * @param data - Datos a actualizar (parcial)
   * @returns Observable que se completa al finalizar
   */
	updateUserProfile(uid: string, data: Partial<UserModel>): Observable<void> {
    if (!uid) {
      return from(Promise.reject('❌ updateUserProfile: UID no proporcionado.'));
    }
    const userRef = doc(this.firestore, `${this.usersCollectionName}/${uid}`);
    console.log('🔄 Actualizando perfil UID:', uid, 'con datos:', data);
    return from(updateDoc(userRef, data));
  }

  /**
   * 🗑 Elimina el perfil de un usuario en Firestore.
   * @param uid - ID del usuario
   * @returns Observable que se completa al eliminar
   */
	deleteUserProfile(uid: string): Observable<void> {
    if (!uid) {
      return from(Promise.reject('❌ deleteUserProfile: UID no proporcionado.'));
    }
    const userRef = doc(this.firestore, `${this.usersCollectionName}/${uid}`);
    console.log('🗑 Eliminando perfil UID:', uid);
    return from(deleteDoc(userRef));
  }

	/**
   * 📥 Obtiene los datos del usuario actualmente autenticado desde Firestore.
   * @returns Observable con los datos del usuario o null
   */

	getUserData(uid: string): Observable<UserModel | null> {
    return this.authService.getAuthState().pipe(
      switchMap((user: any | null) => {
				console.log('📡 authService.getAuthState() emitió:', user);
        if (user && user.uid) {
          //console.log('🔐 Usuario autenticado, cargando datos para UID:', user.uid);
          const userRef = doc(this.firestore, `${this.usersCollectionName}/${user.uid}`);
          return docData(userRef).pipe(
						map(data => {
							const fullUser = { ...data, uid: user.uid } as UserModel;
							//console.log('✅ Usuario con UID fusionado desde el servicio getUserData:', fullUser);
							return fullUser;
						})
					);
        } else {
          console.warn('⚠️ Usuario no autenticado o sesión expirada');
          return of(null);
        }
      })
    );
  }

	/* getUserFromFirestore(uid: string): Observable<UserModel> {
    const userRef = doc(this.firestore, `users/${uid}`);

    return from(getDoc(userRef)).pipe(
      map(snapshot => {
        if (!snapshot.exists()) throw new Error('Usuario no encontrado en Firestore');

        const data = snapshot.data() as Omit<UserModel, 'uid' | 'createdDate'>;
        const userData: UserModel = {
          ...data,
          uid,
          createdDate: new Date(data.created_at.seconds * 1000),
        };

        console.log('%c[Firestore] Usuario cargado:', 'background:#0dcaf0;color:black', userData);
        return userData;
      }),
      catchError(err => {
        console.error('%c[Firestore Error]', 'background:red;color:white;', err);
        return throwError(() => err);
      })
    );
  } */

	// 🔥 FIREBASE: Actualizar usuario
  /* updateUserInFirestore(uid: string, userData: UserModel): Observable<void> {
    const userRef = doc(this.firestore, `users/${uid}`);

    const dataToSave = { ...userData }; // Filtrar campos si es necesario

    return from(setDoc(userRef, dataToSave, { merge: true })).pipe(
      map(() => console.log('%c[Firestore] Usuario actualizado', 'background:#198754;color:white')),
      catchError(err => {
        console.error('%c[Firestore Error al actualizar]', 'background:red;color:white;', err);
        return throwError(() => err);
      })
    );
  } */

	// 🌐 API REST: Obtener usuarios
 /*  getUsersFromApi(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.apiUrl}/users`).pipe(
      map(res => {
        console.log('%c[API] Usuarios desde backend:', 'background:#ffc107;color:black', res);
        return res;
      }),
      catchError(err => {
        console.error('%c[API Error]', 'background:red;color:white;', err);
        return throwError(() => err);
      })
    );
  } */

	  // 🌐 API REST: Obtener usuario por ID
	/* 	getUserByIdFromApi(id: string): Observable<UserModel> {
			return this.http.get<UserModel>(`${this.apiUrl}/users/${id}`).pipe(
				map(res => {
					console.log('%c[API] Usuario individual:', 'background:#ffc107;color:black', res);
					return res;
				}),
				catchError(err => {
					console.error('%c[API Error]', 'background:red;color:white;', err);
					return throwError(() => err);
				})
			);
		} */

 /*  getUserData(uid: string): Observable<UserModel> {
    const userDocRef = doc(this.firestore, `users/${uid}`);

    return from(getDoc(userDocRef)).pipe(
      map(userSnap => {
        if (!userSnap.exists()) {
          throw new Error('El usuario no existe en Firestore');
        }

        const data = userSnap.data() as Omit<UserModel, 'uid' | 'createdDate'>;
        const userData: UserModel = {
          ...data,
          uid: uid,
          createdDate: new Date(data.created_at.seconds * 1000)
        };

        console.log('%c[DEBUG] Usuario obtenido:', 'background: #0dcaf0; color: black;', userData);
        return userData;
      }),
      catchError(err => {
        console.error('%c[ERROR] al obtener usuario:', 'background: red; color: white;', err);
        return throwError(() => err);
      })
    );

	
  } */

	  /**
   * 📝 Actualiza los datos del usuario en Firestore como Observable
   * @param uid ID del usuario
   * @param userData Objeto con datos actualizados
   * @returns Observable<void>
   */
		/* updateUserData(uid: string, userData: UserModel): Observable<void> {
			const userDocRef = doc(this.firestore, `users/${uid}`);
	
			const dataToSave = {
				name: userData.name,
				last_name: userData.last_name,
				email: userData.email,
				user_name: userData.user_name,
				phone: userData.phone,
				mobile: userData.mobile,
				address: userData.address,
				city: userData.city,
				commune: userData.commune,
				profession: userData.profession,
				website: userData.website,
				github: userData.github,
				instagram: userData.instagram,
				twitter: userData.twitter,
				facebook: userData.facebook,
				bio: userData.bio
			};
	
			console.log('%c[DEBUG] Datos a guardar:', 'background: #198754; color: white;', dataToSave);
	
			return from(setDoc(userDocRef, dataToSave, { merge: true })).pipe(
				map(() => {
					console.log('%c[DEBUG] ✅ Datos actualizados en Firestore', 'background: #198754; color: white;');
				}),
				catchError(err => {
					console.error('%c[ERROR] al actualizar datos:', 'background: red; color: white;', err);
					return throwError(() => err);
				})
			);
		} */






	/**
   * Obtiene los datos del usuario desde Firestore usando su UID.
   */
  /* async getUserData(uid: string): Promise<any> {
    const userDoc = doc(this.firestore, `users/${uid}`);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
      const data = userSnap.data() as any;
			const user: UserModel = {
				uid: uid,
				bio: data.bio,
				name: data.name,
				last_name: data.last_name,
				email: data.email,
				user_name: data.user_name,
				surnames: data.surnames,
				mobile: data.mobile,
				phone: data.phone,
				address: data.address,
				city: data.city,
				commune: data.commune,
				profession: data.profession,
				photoURL: data.photoURL,
				website: data.website,
				github: data.github,
				instagram: data.instagram,
				twitter: data.twitter,
				facebook: data.facebook,
				created_at: data.created_at,
				createdDate: new Date(data.created_at.seconds * 1000)
			};
		
			return user;
    } else {
      throw new Error('Usuario no encontrado en Firestore');
    }
  } */

	/* updateUserData(uid: string, userData: UserModel): Promise<void> {
		const userDoc = doc(this.firestore, `users/${uid}`);
	
		// Preparamos una copia sin campos innecesarios o incompatibles
		const dataToSave = {
			name: userData.name,
			last_name: userData.last_name,
			surnames: userData.surnames || '',
			email: userData.email,
			user_name: userData.user_name,
			phone: userData.phone || '',
			website: userData.website || '',
			address: userData.address || '',
			bio: userData.bio || '',
			photoURL: userData.photoURL || ''
		};
	
		return setDoc(userDoc, dataToSave, { merge: true });
	} */

		 
		 
		
		
	
}
