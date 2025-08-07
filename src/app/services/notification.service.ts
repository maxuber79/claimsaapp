import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where, orderBy } from '@angular/fire/firestore';
import { doc, updateDoc, Timestamp, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { UserNotification } from '../models/UserNotification.model'; // Adjust the import path as necessary

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor( private firestore: Firestore ) {
		console.log('%c<<< Start NOTIFICATION service >>>','background: #fff3cd; color: #664d03; padding: 2px 5px;');
	}

	 /**
   * Enviar una notificación a un usuario específico (por UID)
   */
	async sendToUser(uid: string, message: string, type: 'asignado' | 'urgente' | 'editado' | 'cerrado' | 'admin-alert' ): Promise<void> {
  try {
    const newNoti: UserNotification = {
      message,
      type,
      timestamp: Timestamp.now(), // 👈 Firestore-friendly
      read: false
    };

    const notiRef = collection(this.firestore, `users/${uid}/notifications`);
    const docRef = await addDoc(notiRef, newNoti);

    console.log('✅ Notificación enviada:', { uid, message, docId: docRef.id });
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
    throw error; // opcional: para que la función realmente "falle"
  }
	}

	/**
   * Envía una notificación a todos los administradores
   * @param message Mensaje de la notificación
   * @param type Tipo de notificación (ej: 'admin-alert', 'info', etc.)
   */
	async sendToAdmins(message: string, type: 'asignado' | 'urgente' | 'editado' | 'cerrado' | 'admin-alert'): Promise<void> {
  try {
    // 1. Buscar usuarios con rol 'Administrador'
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('rol', '==', 'Administrador'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.warn('⚠️ No se encontraron administradores para notificar');
      return;
    }

    // 2. Enviar notificación a cada admin
    const promises: Promise<void>[] = [];
    	snapshot.forEach(docSnap => {
      	const adminUid = docSnap.id; // UID del admin
      	promises.push(this.sendToUser(adminUid, message, type));
    });

			await Promise.all(promises);
			console.log(`✅ Notificación enviada a ${snapshot.size} administradores`);
		} catch (error) {
			console.error('❌ Error al enviar notificación a administradores:', error);
		}
	}

	/**
   * Obtener las notificaciones de un usuario
   */
  getUserNotifications(uid: string): Observable<UserNotification[]> {
    const notiRef = collection(this.firestore, `users/${uid}/notifications`);
    const q = query(notiRef, orderBy('timestamp', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<UserNotification[]>;
  }

	/**
   * Marcar una notificación como leída
   */
  async markAsRead(uid: string, notificationId: string): Promise<void> {
    try {
      const ref = doc(this.firestore, `users/${uid}/notifications/${notificationId}`);
      await updateDoc(ref, { read: true });
      console.log('✅ Notificación marcada como leída:', notificationId);
    } catch (error) {
      console.error('❌ Error al marcar notificación como leída:', error);
    }
  }

	/**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(uid: string): Promise<void> {
		const notifCollectionRef = collection(this.firestore, `users/${uid}/notifications`);
		const snapshot = await getDocs(notifCollectionRef);
		const batch = writeBatch(this.firestore);

		snapshot.forEach(docSnap => {
			if (!docSnap.data()['read']) {
				batch.update(docSnap.ref, { read: true });
			}
		});

		await batch.commit();
		console.log(`✅ Todas las notificaciones del usuario ${uid} marcadas como leídas.`);
	}
	/**
	 * Eliminar una notificación individual
	 */
	deleteNotification(uid: string, notifId: string): Promise<void> {
  const ref = doc(this.firestore, `users/${uid}/notifications/${notifId}`);
  return deleteDoc(ref)
    .then(() => console.log(`🧹 Notificación ${notifId} eliminada de Firestore`))
    .catch(err => console.error('❌ Error al eliminar notificación:', err));
	}

	
}
