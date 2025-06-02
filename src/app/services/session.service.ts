import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        const ref = doc(this.firestore, `users/${user.uid}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          this.userDataSubject.next({ uid: user.uid, ...snap.data() });
        } else {
          this.userDataSubject.next(null);
        }
      } else {
        this.userDataSubject.next(null);
      }
    });
  }

  get currentUser() {
    return this.userDataSubject.value;
  }
}
