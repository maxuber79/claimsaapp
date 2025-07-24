import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  Firestore,
  addDoc,
  docData
} from '@angular/fire/firestore';
import { Claim } from '../models/claims';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { collection as col, getDocs, query, where } from 'firebase/firestore';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ClaimsService {

  constructor(
		private firestore: Firestore,
    private authService: AuthService,
    private userService: UserService
	) { console.log('%c<<< Start CLAIMS service >>>','background: #fff3cd; color: #664d03; padding: 2px 5px;'); }

	// 🟢 Crea un reclamo para un usuario específico
  createClaim(uid: string, claim: Claim): Promise<void> {
    const id = claim.id || doc(col(this.firestore, `users/${uid}/claims`)).id;
    const ref = doc(this.firestore, `users/${uid}/claims/${id}`);
    return setDoc(ref, { ...claim, id });
  }

	// 🔄 Actualiza un reclamo existente. (por ejemplo, cambiar estado)
  updateClaim(uid: string, claim: Claim): Promise<void> {
    const ref = doc(this.firestore, `users/${uid}/claims/${claim.id}`);
    return updateDoc(ref, { ...claim });
  }

	// 🔴 Elimina un reclamo (solo admins)
  deleteClaim(uid: string, claimId: string): Promise<void> {
    const ref = doc(this.firestore, `users/${uid}/claims/${claimId}`);
    return deleteDoc(ref);
  }

  // 📄 Obtiene todos los reclamos de un usuario
  getUserClaims(uid: string): Observable<Claim[]> {
    const ref = collection(this.firestore, `users/${uid}/claims`);
    return collectionData(ref, { idField: 'id' }) as Observable<Claim[]>;
  }

	/**
 * 🧾 Trae todos los reclamos desde todos los ejecutivos (solo para administrador)
 */
/**
 * 🔍 Trae todos los reclamos de todos los ejecutivos para el Administrador
 */
getAllClaims(): Observable<Claim[]> {
  const usersRef = collection(this.firestore, 'users');
	console.log('🔍 Buscando todos los reclamos de todos los ejecutivos...', usersRef);
  return from(getDocs(usersRef)).pipe(
    switchMap((userSnapshots) => {
      const claimPromises = userSnapshots.docs.map((doc) => {
        const uid = doc.id;
        const claimsRef = collection(this.firestore, `users/${uid}/claims`);
        return getDocs(claimsRef).then((claimSnap) =>
          claimSnap.docs.map((c) => ({ ...(c.data() as Claim), uidEjecutivo: uid }))
        );
      });

      return from(Promise.all(claimPromises));
    }),
    map((claimsNestedArray) => claimsNestedArray.flat())
  );
}

/**
   * 🎯 Obtiene los reclamos de un ejecutivo específico por su UID.
   * @param uid El UID del ejecutivo.
   * @returns Observable<Claim[]> Un observable de un array de reclamos.
   */
  getClaimsByUid(uid: string): Observable<Claim[]> {
    const claimsRef = collection(this.firestore, `users/${uid}/claims`);
    // Convertimos la Promise de getDocs a un Observable usando 'from' de RxJS
    return from(getDocs(claimsRef)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({ ...(doc.data() as Claim), uidEjecutivo: uid, id: doc.id })) // 🔥 Asegúrate de incluir el 'id' del documento
      )
    );
  }

// 🌍 Obtiene todos los reclamos de todos los ejecutivos
/*getAllClaims(): Observable<Claim[]> {
  const usersRef = collection(this.firestore, 'users');

  return from(getDocs(usersRef)).pipe(
    switchMap(snapshot => {
      const promises = snapshot.docs.map(doc => this.getClaimsByUid(doc.id));
      return from(Promise.all(promises));
    }),
    map(claimArrays => claimArrays.flat())
  );
}

*/

}
