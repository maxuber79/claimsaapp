import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, collection, collectionData, docData, updateDoc, deleteDoc } from '@angular/fire/firestore'; 
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { Claim } from '../models/claims';

@Injectable({
  providedIn: 'root'
})
export class ClaimsDummyService {

	private jsonUrl = 'assets/data/claims-expanded.json';


  constructor( private http: HttpClient ) { console.log('%c<<< Start CLAIMS DUMMY service >>>','background: #fff3cd; color: #664d03; padding: 2px 5px;'); }

	/**
   * Obtiene todos los reclamos de un usuario específico desde el archivo JSON
   * @param uid string - ID del usuario
   */
  getClaimsByUser(uid: string): Observable<any[]> {
    return this.http.get<any>(this.jsonUrl).pipe(
      map(data => data.users[uid]?.claims || [])
    );
  }

	/**
   * Obtiene todos los reclamos de todos los usuarios (para vista administrador)
   */
  getAllClaims(): Observable<any[]> {
    return this.http.get<any>(this.jsonUrl).pipe(
      map(data => {
        const allUsers = Object.values(data.users);
        const allClaims = allUsers.flatMap((u: any) => u.claims || []);
        return allClaims;
      })
    );
  }


}
