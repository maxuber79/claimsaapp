import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserNotification } from '../../../models/UserNotification.model';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';

/* Services */
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service'; 
import { UserService } from '../../../services/user.service'; 
import { TodoService } from '../../../services/todo.service';


@Component({
  selector: 'app-admin-notifications',
  imports: [CommonModule, RouterModule, NgIf, NgFor, FormsModule],
  templateUrl: './admin-notifications.component.html',
  styleUrl: './admin-notifications.component.scss'
})
export class AdminNotificationsComponent {

	notifications: UserNotification[] = [];
  uid: string = '';
	filterState: 'todas' | 'leidas' | 'no-leidas' = 'todas';
	fechaOrden: 'asc' | 'desc' = 'desc';

	currentPage: number = 1;
	itemsPerPage: number = 10;


	constructor(private notificationService: NotificationService,private authService: AuthService) {
		console.log('🔔 Componente de notificaciones del administrador inicializado');
	}
	ngOnInit(): void {
		this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.uid = user.uid;
				console.log(`%c🔍 UID: ${this.uid}`, 'background: #6610f2; color: #ffffff; padding: 2px 5px;',);
        this.loadNotifications();
      } else {
        console.error('❌ No hay usuario autenticado');
      }
    });
	}

	/**
   * Carga las notificaciones del admin autenticado
   */
  loadNotifications(): void {
    this.notificationService.getUserNotifications(this.uid).subscribe({
      next: (notifs) => {
        this.notifications = notifs;
        console.log('🔔 Notificaciones del admin:', notifs);
      },
      error: (err) => console.error('❌ Error al cargar notificaciones:', err)
    });
  }

	marcarComoLeida(notif: UserNotification): void {
    if (!notif.read) {
      if (notif.id) {
        this.notificationService.markAsRead(this.uid, notif.id)
          .then(() => notif.read = true)
          .catch(err => console.error('❌ Error al marcar como leída:', err));
      } else {
        console.error('❌ La notificación no tiene un ID válido');
      }
    }
  }

	eliminarNotif(notif: UserNotification): void {
    this.notificationService.deleteNotification(this.uid, notif.id ? notif.id : '')
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
      })
      .catch(err => console.error('❌ Error al eliminar notificación:', err));
  }

	/**
   * Marca una notificación como leída si aún no lo está
   * @param notif Notificación a marcar
   */
  markAsRead(notif: UserNotification): void {
    if (!notif.read) {
      this.notificationService.markAsRead(this.uid, notif.id!)
        .then(() => {
          notif.read = true;
          console.log(`✅ Notificación ${notif.id} marcada como leída`);
        })
        .catch(err => console.error('❌ Error al marcar como leída:', err));
    }
  }

	 /**
   * Elimina una notificación
   * @param notif Notificación a eliminar
   */
  deleteNotification(notif: UserNotification): void {
    this.notificationService.deleteNotification(this.uid, notif.id!)
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        console.log(`🗑️ Notificación ${notif.id} eliminada`);
      })
      .catch(err => console.error('❌ Error al eliminar notificación:', err));
  }

	markAllAsRead(): void {
  this.notificationService.markAllAsRead(this.uid)
    .then(() => {
      // Marcar localmente también
      this.notifications = this.notifications.map(n => ({ ...n, read: true }));
      console.log('✅ Todas las notificaciones marcadas como leídas.');
    })
    .catch(err => {
      console.error('❌ Error al marcar todas como leídas:', err);
    });
	}

	get allRead(): boolean {
		return this.notifications.every(n => n.read);
	}

	get filteredNotifications(): UserNotification[] {
  let lista = [...this.notifications]; // ¡Clonamos para no mutar el original!

  // Filtro de lectura
  switch (this.filterState) {
    case 'leidas':
      lista = lista.filter(n => n.read);
      break;
    case 'no-leidas':
      lista = lista.filter(n => !n.read);
      break;
  }

  // Orden por fecha
  lista.sort((a, b) => {
    const tA = a.timestamp?.seconds ?? 0;
    const tB = b.timestamp?.seconds ?? 0;
    return this.fechaOrden === 'desc' ? tB - tA : tA - tB;
  });

  return lista;
	}	

	get paginatedNotifications(): UserNotification[] {
		const filtered = this.filteredNotifications; // ya ordenado y filtrado por estado/fecha
		const start = (this.currentPage - 1) * this.itemsPerPage;
		const end = start + this.itemsPerPage;
		return filtered.slice(start, end);
	}

	get totalPages(): number {
		return Math.ceil(this.filteredNotifications.length / this.itemsPerPage);
	}



}
