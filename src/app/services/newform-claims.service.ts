import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Claim } from '../models/claims';

/**
 * Servicio para gestionar reclamos por usuario
 */
@Injectable({ providedIn: 'root' })
export class ClaimsService {
  private readonly basePath = 'users';

  constructor(private firestore: Firestore) {}

  /**
   * 🔍 Obtiene todos los reclamos de un usuario por su UID
   * @param uid UID del usuario ejecutivo
   * @returns Observable con los reclamos
   */
  getClaimsByUid(uid: string): Observable<Claim[]> {
    const path = `${this.basePath}/${uid}/claims`;
    const ref = collection(this.firestore, path);
    return collectionData(ref, { idField: 'id' }) as Observable<Claim[]>;
  }

  /**
   * ➕ Agrega un nuevo reclamo a un usuario específico
   * @param uid UID del ejecutivo
   * @param claim Reclamo a agregar
   */
  addClaimToUser(uid: string, claim: Claim): Promise<void> {
    const docRef = doc(this.firestore, `${this.basePath}/${uid}/claims/${claim.id}`);
    return setDoc(docRef, claim);
  }

  /**
   * ✏️ Edita un reclamo existente de un usuario
   * @param uid UID del ejecutivo
   * @param claim Reclamo modificado
   */
  editClaim(uid: string, claim: Claim): Promise<void> {
    const docRef = doc(this.firestore, `${this.basePath}/${uid}/claims/${claim.id}`);
    return setDoc(docRef, claim, { merge: true });
  }

  /**
   * 🗑 Elimina un reclamo de un ejecutivo
   * @param uid UID del ejecutivo
   * @param claimId ID del reclamo a eliminar
   */
  deleteClaim(uid: string, claimId: string): Promise<void> {
    const docRef = doc(this.firestore, `${this.basePath}/${uid}/claims/${claimId}`);
    return deleteDoc(docRef);
  }
}
/* 
📌 Crear nuevo reclamo:
this.claimsService.addClaimToUser(ejecutivoUid, nuevoReclamo).then(() => {
  this.alert.success('Reclamo creado');
});
📌 Editar reclamo:
this.claimsService.editClaim(ejecutivoUid, reclamoEditado).then(() => {
  this.alert.success('Reclamo actualizado');
});
📌 Eliminar reclamo:
this.claimsService.deleteClaim(ejecutivoUid, claimId).then(() => {
  this.alert.success('Reclamo eliminado');
});

*/
