import { Component, inject, OnInit } from '@angular/core';
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


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor, FormsModule],
  templateUrl: './notification.component.html'
})
export class NotificationsComponent implements OnInit {
  //private notificationService = inject(NotificationService);
  //private authService = inject(AuthService);
	uid = ''; 
  notifications: UserNotification[] = [];
  loading = true;	

  // Filtros
  filterState: 'todas' | 'leidas' | 'no-leidas' = 'todas';
  fechaOrden: 'asc' | 'desc' = 'desc';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;


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

	loadNotifications(): void {
    this.notificationService.getUserNotifications(this.uid).subscribe({
      next: (notifs) => {
        this.notifications = notifs ?? [];
        this.currentPage = Math.min(this.currentPage, this.totalPages);
      },
      error: (err) => console.error('❌ Error al cargar notificaciones (exec):', err)
    });
  }

	// Fecha robusta
  asDate(ts: unknown): Date {
    if (!ts) return new Date(0);
    if (ts instanceof Date) return ts;
    if (typeof ts === 'number') return new Date(ts);
    if ((ts as any).toDate) return (ts as any).toDate();
    return new Date(ts as any);
  }

	// Filtrado + orden
  get filteredNotifications(): UserNotification[] {
    let list = [...this.notifications];

    if (this.filterState === 'leidas') {
      list = list.filter(n => n.read);
    } else if (this.filterState === 'no-leidas') {
      list = list.filter(n => !n.read);
    }

    list.sort((a, b) => {
      const aT = this.asDate(a.timestamp).getTime();
      const bT = this.asDate(b.timestamp).getTime();
      return this.fechaOrden === 'asc' ? aT - bT : bT - aT;
    });

    return list;
  }

	// Paginación (sobre filtradas)
  get totalItems(): number {
    return this.filteredNotifications.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pagedNotifications(): UserNotification[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredNotifications.slice(start, start + this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }


 onItemsPerPageChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.itemsPerPage = value;
    this.currentPage = 1;
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
  }

  // Acciones
  markAsRead(notif: UserNotification): void {
    if (notif.read || !notif.id) return;
    this.notificationService.markAsRead(this.uid, notif.id)
      .then(() => notif.read = true)
      .catch(err => console.error('❌ Error al marcar como leída (exec):', err));
  }

  deleteNotification(notif: UserNotification): void {
    if (!notif.id) return;
    this.notificationService.deleteNotification(this.uid, notif.id)
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        if ((this.currentPage - 1) * this.itemsPerPage >= this.totalItems) {
          this.currentPage = Math.max(1, this.currentPage - 1);
        }
      })
      .catch(err => console.error('❌ Error al eliminar notificación (exec):', err));
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.uid)
      .then(() => this.notifications = this.notifications.map(n => ({ ...n, read: true })))
      .catch(err => console.error('❌ Error al marcar todas (exec):', err));
  }

  get allRead(): boolean {
    return this.notifications.length > 0 && this.notifications.every(n => n.read);
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