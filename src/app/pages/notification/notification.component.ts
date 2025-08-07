import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserNotification } from '../../models/UserNotification.model';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
/* Services */
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service'; 
import { UserService } from '../../services/user.service'; 
import { TodoService } from '../../services/todo.service';


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './notification.component.html'
})
export class NotificationsComponent implements OnInit {
  //private notificationService = inject(NotificationService);
  //private authService = inject(AuthService);

  notifications: UserNotification[] = [];
  loading = true;

	constructor(private route: ActivatedRoute, private auth: AuthService, private notificationService: NotificationService,private alertService: AlertService,) {
		console.log('🔔 Componente de notificaciones inicializado');
	}

  async ngOnInit(): Promise<void> {
		const uid = this.route.snapshot.paramMap.get('uid');
		console.log('🔍 UID encontrado en componente de notificaciones:', uid);
  if (!uid) {
    console.warn('❌ No se encontró UID en la ruta');
    return;
  }
	this.notificationService.getUserNotifications(uid).subscribe({
		next: (notifications) => {
			this.notifications = notifications;
			console.log('📨 Notificaciones cargadas:', this.notifications);
		},
		error: (error) => {
			console.error('❌ Error cargando notificaciones:', error);
		}
	});
  try {
    //this.notifications = await this.notificationService.getUserNotifications(uid);
    console.log('📨 Notificaciones cargadas:', this.notifications);
  } catch (error) {
    console.error('❌ Error cargando notificaciones:', error);
  } finally {
    this.loading = false;
  }
    /* const user = await this.authService.getCurrentUser();

    if (!user) {
      console.warn('❌ Usuario no autenticado');
      return;
    }

    try {
      this.notifications = await this.notificationService.getUserNotifications(user.uid);
      console.log('📨 Notificaciones cargadas:', this.notifications);
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
    } finally {
      this.loading = false;
    } */
  }

	async markAsRead(notification: UserNotification): Promise<void> {
	const uid = this.route.snapshot.paramMap.get('uid');
	if (!uid || !notification.id) return;

	try {
		await this.notificationService.markAsRead(uid, notification.id);
		notification.read = true; // ⚠️ Esto actualiza la UI localmente
		this.notifications = this.notifications.filter(n => !n.read); // Oculta si quieres que no se vean las leídas
		console.log(`📗 Notificación marcada como leída: ${notification.message}`);
		this.alertService.showToastSuccess('Notificación marcada como leída', 'Mensaje importante!');
	} catch (err) {
		console.error('❌ Error al marcar como leída:', err);
	}
	}

	async deleteNotification(notification: UserNotification): Promise<void> {
	const uid = this.route.snapshot.paramMap.get('uid');
	if (!uid || !notification.id) return;

	try {
		await this.notificationService.deleteNotification(uid, notification.id);
		this.notifications = this.notifications.filter(n => n.id !== notification.id);
		console.log(`🗑️ Notificación eliminada: ${notification.message}`);
		this.alertService.showToastError('Notificación eliminada', 'Mensaje importante!');
	} catch (err) {
		console.error('❌ Error al eliminar notificación:', err);
	}
}

async markAllAsRead(): Promise<void> {
  const uid = this.route.snapshot.paramMap.get('uid');
  if (!uid) return;

  try {
    for (const notif of this.notifications) {
      if (!notif.read && notif.id) {
        await this.notificationService.markAsRead(uid, notif.id);
        notif.read = true;
      }
    }
    // Opcional: ocultarlas si quieres que no se vean
    this.notifications = this.notifications.filter(n => !n.read);
		this.alertService.showToastSuccess('Notificación marcada como leída','Todas las notificaciones');
    console.log('📗 Todas las notificaciones marcadas como leídas');
  } catch (err) {
    console.error('❌ Error al marcar todas como leídas:', err);
  }
}



  /* async markAsRead(notification: UserNotification): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user || !notification.id) return;

    try {
      await this.notificationService.markAsRead(user.uid, notification.id);
      notification.read = true;
    } catch (err) {
      console.error('❌ Error al marcar como leída:', err);
    }
  } */

  /* async deleteNotification(notification: UserNotification): Promise<void> {
    const user = await this.authService.getCurrentUser();
    if (!user || !notification.id) return;

    try {
      await this.notificationService.deleteNotification(user.uid, notification.id);
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
    } catch (err) {
      console.error('❌ Error al eliminar notificación:', err);
    }
  } */
}