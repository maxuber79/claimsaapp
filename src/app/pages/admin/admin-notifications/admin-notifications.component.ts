import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserNotification } from '../../../models/UserNotification.model';

/* Services */
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor, FormsModule],
  templateUrl: './admin-notifications.component.html',
  styleUrls: ['./admin-notifications.component.scss']
})
export class AdminNotificationsComponent implements OnInit {

  uid = '';
  notifications: UserNotification[] = [];

  // Filtros
  filterState: 'todas' | 'leidas' | 'no-leidas' = 'todas';
  fechaOrden: 'asc' | 'desc' = 'desc';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    console.log('🔔 AdminNotifications inicializado');
  }

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(user => {
      if (!user) {
        console.error('❌ No hay usuario autenticado');
        return;
      }
      this.uid = user.uid;
      console.log('%c🔍 UID: ' + this.uid, 'background:#6610f2;color:#fff;padding:2px 5px;');
      this.loadNotifications();
    });
  }

  /**
   * Carga las notificaciones del admin autenticado
   */
  loadNotifications(): void {
    this.notificationService.getUserNotifications(this.uid).subscribe({
      next: (notifs) => {
        this.notifications = notifs ?? [];
        console.log('🔔 Notificaciones del admin:', notifs);
        // Si estabas en una página alta y bajó el total, ajusta
        this.currentPage = Math.min(this.currentPage, this.totalPages);
      },
      error: (err) => console.error('❌ Error al cargar notificaciones:', err)
    });
  }

  /**
   * Helper robusto para convertir cualquier timestamp a Date
   */
  asDate(ts: unknown): Date {
    if (!ts) return new Date(0);
    if (ts instanceof Date) return ts;
    if (typeof ts === 'number') return new Date(ts);
    if ((ts as any).toDate) return (ts as any).toDate();
    return new Date(ts as any);
  }

  /**
   * Lista filtrada y ordenada (NO muta el arreglo original)
   */
  get filteredNotifications(): UserNotification[] {
    let list = [...this.notifications];

    // Filtro por leído / no leído
    if (this.filterState === 'leidas') {
      list = list.filter(n => n.read);
    } else if (this.filterState === 'no-leidas') {
      list = list.filter(n => !n.read);
    }

    // Orden por fecha (robusto con Timestamp/Date/number)
    list.sort((a, b) => {
      const aT = this.asDate(a.timestamp).getTime();
      const bT = this.asDate(b.timestamp).getTime();
      return this.fechaOrden === 'asc' ? aT - bT : bT - aT;
    });

    return list;
  }

  /**
   * Paginación basada en la lista FILTRADA
   */
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
    // 👆 ESTE es el que debes usar en el *ngFor*
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  onItemsPerPageChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.itemsPerPage = value;
    this.currentPage = 1; // reset
  }

  /**
   * Marcar como leída (único método)
   */
  markAsRead(notif: UserNotification): void {
    if (notif.read || !notif.id) return;
    this.notificationService.markAsRead(this.uid, notif.id)
      .then(() => {
        notif.read = true;
        console.log(`✅ Notificación ${notif.id} marcada como leída`);
        // Reaplicar filtros/orden si quieres “reubicarla” por fecha/estado:
        // this.currentPage = 1; // opcional
      })
      .catch(err => console.error('❌ Error al marcar como leída:', err));
  }

  /**
   * Eliminar (único método)
   */
  deleteNotification(notif: UserNotification): void {
    if (!notif.id) return;
    this.notificationService.deleteNotification(this.uid, notif.id)
      .then(() => {
        this.notifications = this.notifications.filter(n => n.id !== notif.id);
        console.log(`🗑️ Notificación ${notif.id} eliminada`);
        // Ajustar página si te quedaste sin elementos en la última página
        if ((this.currentPage - 1) * this.itemsPerPage >= this.totalItems) {
          this.currentPage = Math.max(1, this.currentPage - 1);
        }
      })
      .catch(err => console.error('❌ Error al eliminar notificación:', err));
  }

  /**
   * Marcar todas como leídas
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead(this.uid)
      .then(() => {
        this.notifications = this.notifications.map(n => ({ ...n, read: true }));
        console.log('✅ Todas las notificaciones marcadas como leídas.');
      })
      .catch(err => console.error('❌ Error al marcar todas como leídas:', err));
  }

  get allRead(): boolean {
    return this.notifications.length > 0 && this.notifications.every(n => n.read);
  }

  /**
   * Badge por tipo
   */
  badgeClass(type: UserNotification['type']): string {
    switch (type) {
      case 'asignado':    return 'text-bg-warning';
      case 'editado':     return 'text-bg-primary';
      case 'cerrado':     return 'text-bg-success';
      case 'urgente':     return 'text-bg-danger';
      case 'admin-alert': return 'text-bg-dark';
      default:            return 'text-bg-secondary';
    }
  }

  /**
   * Utilidad: cuando cambias filtros desde HTML
   * (solo resetea página; la lista se recalcula vía getters)
   */
  onFiltersChanged(): void {
    this.currentPage = 1;
  }
}
