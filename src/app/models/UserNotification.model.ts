export interface UserNotification {
  id?: string;
  message: string;
	type: 'asignado' | 'urgente' | 'editado' | 'cerrado'; // NUEVO
  read: boolean;
  timestamp: any; // Firestore Timestamp
}