import { Component , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; 

import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, forkJoin, of, map, take, tap, switchMap, catchError } from 'rxjs';
import { ActivatedRoute } from '@angular/router'; // Para obtener el UID de la ruta, si aplica


/* Models Interfaces */
import { UserModel } from '../../models/user';
import { UserNotification } from '../../models/UserNotification.model'; // Asegúrate de que la ruta sea correcta
import { Todo } from '../../models/todo.model';
/* Services */
import { AlertService } from '../../services/alert.service';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { TodoService } from '../../services/todo.service';


import { TodoStatsComponent } from '../dashboard/components/todo-stats.component'; // Ajusta la ruta
import { TodoChartComponent } from '../dashboard/components/todo-chart.component';

import { MockDataService } from '../../services/mock-data.service';
 
import { ComponentsComponent } from '../../shared/components/components.component'; 
import { Notification } from '../../models/notification.model';

interface Metrics {
	color: string;
	count: number;
	footerText: string;
	icon: string;
	label: string;
	trendIcon: string;
}

@Component({
  selector: 'app-dashboard',
	standalone: true,
  imports: [CommonModule, RouterModule, ComponentsComponent ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

	userData: UserModel | null = null; // o puedes usar una interfaz como UserData
  isLoading: boolean = true;
	imagePath: string = 'assets/images/isotipo-webmain.svg';
	imageDefault: string = 'https://maxuber79.github.io/gsaforce/assets/images/face28.jpg';
	
	apodoUser: string = "perrito";

	user: UserModel | null = null;
	uid: string | null = null;
	profilePhotoURL: string = '';

	pendingCount: number = 0;

	todos: Todo[] = []; // Asegúrate que este array esté definido y poblado

	metrics: any ='';
	tickets: any;
	satisfaction: any;
	channels: any;
	channelLabels: string[] = ['Web', 'App', 'WhatsApp', 'Call Center'];
	channelData: number[] = [40, 25, 20, 15];
	//notifications: any[] = [];
	channelsData: { name: string; value: number }[] = [];
	perfil: UserModel | null = null; 
	userRol: string = ''; // puede ser 'Administrador' | 'Ejecutivo' | 'Usuario'

	// 👇 Para notificaciones
  notifications: UserNotification[] = [];
  pendingCountNotification: number = 0;
  uidNotification: string = '';
 
	showNotiDropdown = false;
	currentUid: string = '';
	unreadCount = 0;

	constructor(
		private route: ActivatedRoute,
		private auth: Auth,
		private userService: UserService,
		private authService: AuthService,
		private router: Router,
		private todoService: TodoService,
		private alertaService: AlertService,
		private mockService: MockDataService,
		private notificationService: NotificationService
	) {
		console.log('%c<<< Start DashboardComponent >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;');
	}

	/**
   * 🚀 Hook de ciclo de vida que se ejecuta al cargar el componente
   * Intenta obtener los datos del usuario autenticado desde Firestore
   */
	ngOnInit(): void {
		console.log('📦 Iniciando carga de usuario en dashboard...');

		this.authService.getCurrentUser().subscribe( user => {
			if (user) {
				this.uid = user.uid;
				console.log(`%c 📦 Usuario autenticado: ${user.uid}:`,'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', user);

				 


				this.userService.getUserData(user.uid).subscribe( userData => {
					console.log(`%c 📦 Usuario autenticado ----> ${user.uid}:`,'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', userData);
					this.userData = userData;
					this.uid = userData?.uid || '';
					this.perfil = userData;
					this.userRol = userData?.rol || 'Usuario'; // <-- aquí obtienes el rol
					console.log('Rol del usuario:', this.userRol);
				/* 	this.authService.getCurrentUser().pipe(
						switchMap(user => this.userService.getUserData(user.uid))
					).subscribe({
						next: (data) => {
							this.uid = data?.uid || '';
							this.userService.getUserData(this.uid).subscribe({
					next: (user) => {
						this.perfil = user;
						this.userRol = user?.rol || 'Usuario'; // <-- aquí obtienes el rol
						console.log('Rol del usuario:', this.userRol);
					}
				}); */
					/*this.userData = {
					...userData,
					email: userData.email ?? '',
					photoURL: userData.photoURL ?? this.imageDefault
				};
				console.log(`%c 📦 Usuario autenticado: ${user.uid}:`,'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', user);
				this.profilePhotoURL = user.photoURL || this.imageDefault;
				this.apodoUser = user.displayName || 'Usuario'; */
				});

				// ✅ Escuchar notificaciones del usuario actual
				this.notificationService.getUserNotifications(user.uid).subscribe(nots => {
					this.notifications = nots;
					this.unreadCount = nots.filter(n => !n.read).length;
					console.log('🔔 --- Notificaciones del usuario:', this.notifications);
					console.log('🔔 ::: Todas las notificaciones:', nots);
  				console.log('📬 Cantidad de no leídas:', this.unreadCount);
				
					nots.forEach(n => console.log(`📄 ${n.message} | Leída: ${n.read}`));

					// Log principal
					console.log('📬 Cantidad de no leídas ---->', this.unreadCount);
						this.notifications.forEach(n => {
						console.log(`🔸 Mensaje: ${n.message} | Leída: ${n.read}`);
					});
				});

				//this.listenToNotifications();//-----> Tengo que habilitar cuando esté el servicio de notificaciones listo
			}
		});
	}

	toggleNotiDropdown() {
  	this.showNotiDropdown = !this.showNotiDropdown;
	}

	listenToNotifications(): void {
    this.notificationService.getUserNotifications(this.uidNotification).subscribe(data => {
      this.notifications = data;
      this.pendingCountNotification = data.filter(n => !n.read).length;

      console.log('🔔 Notificaciones para', this.uidNotification, ':', this.notifications);
      console.log('📬 No leídas:', this.pendingCountNotification);
    });
  }

	marcarComoLeida(notif: UserNotification): void {
		console.log('🔔 Marcando como leída la notificación:', notif);
		if (notif.read || !notif.id || !this.uid) return; // ya está leída o sin ID

		this.notificationService.markAsRead(this.uid, notif.id)
			.then(() => console.log(`📬 Notificación marcada como leída: ${notif.message}`))
			.catch(err => console.error('❌ Error al marcar como leída:', err));
	}
	

	marcarTodasComoLeidas(): void {
		if (!this.uid) return;

		this.notificationService.markAllAsRead(this.uid)
			.then(() => console.log('📬 Todas las notificaciones marcadas como leídas'))
			.catch(err => console.error('❌ Error al marcar todas como leídas:', err));
	}

	eliminarNotificacion(notif: UserNotification): void {
		if (!notif.id || !this.uid) return;

		const confirmar = confirm('¿Estás seguro de eliminar esta notificación?');
		if (!confirmar) return;

		this.notificationService.deleteNotification(this.uid, notif.id)
			.then(() => console.log(`🗑️ Notificación eliminada: ${notif.message}`))
			.catch(err => console.error('❌ Error al eliminar notificación:', err));
	}


	async onLogout() {
		try {
			await this.authService.logout();
			this.router.navigate(['/']);
		} catch (error) {
			console.error('❌ Error al cerrar sesión:', error);
		}
	}

	/**
   * ➡️ Función para navegar al componente de perfil usando el UID del usuario
   */
  goToProfile(): void {
    if (this.userData?.uid) {
      //console.log('➡️ Navegando al perfil con UID:', this.userData.uid);
      this.router.navigate(['/dashboard/profile', this.userData.uid]);
    } else {
      console.error('❌ No se encontró UID para navegar al perfil');
    }
  }

	get unreadNotificationsCount(): number {
		const count = this.notifications?.filter(n => !n.read).length || 0;
		console.log('🔴 Notificaciones no leídas:', count);
		return count;
	}

	get unreadNotifications(): UserNotification[] {
  return this.notifications
    .filter(n => !n.read)
    .slice(0, 5); // solo las primeras 5
	}



}
