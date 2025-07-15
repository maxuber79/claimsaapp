import { Component , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; 
import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription, combineLatest, forkJoin, of, map, take, tap, switchMap, catchError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

/* Interfaces */
import { UserModel } from '../../../models/user';
import { Todo } from '../../../models/todo.model';


/* Servicios */
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { TodoService } from '../../../services/todo.service';
import { AlertService } from '../../../services/alert.service';
import { MockDataService } from '../../../services/mock-data.service';

/* Components */
import { CardMetricComponent } from '../components/card-metric.component';
import { LineChartComponent } from '../components/line-chart.component';
import {  SatisfactionChartComponent } from '../components/satisfaction-chart.component';
import { ChannelsChartComponent } from '../components/channels-chart.component';
import { NotificationListComponent } from '../components/notification-list.component';
import { ReclamosTableComponent } from '../components/reclamos-table.component';

interface Metrics {
	color: string;
	count: number;
	footerText: string;
	icon: string;
	label: string;
	trendIcon: string;
}

@Component({
  selector: 'app-analytics',
	standalone: true,
  imports: [ CommonModule, RouterModule, CardMetricComponent, LineChartComponent, SatisfactionChartComponent, ChannelsChartComponent, NotificationListComponent, ReclamosTableComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {

	userData: UserModel | null = null; // o puedes usar una interfaz como UserData
	isLoading: boolean = true;
	imagePath: string = 'assets/images/isotipo-webmain.svg';
	imageDefault: string = 'https://maxuber79.github.io/gsaforce/assets/images/face28.jpg';

	user: UserModel | null = null;
	uid: string | null = null;
	profilePhotoURL: string = '';

	pendingCount: number = 0;
	
	metrics: any ='';
	tickets: any;
	satisfaction: any;
	channels: any;
	channelLabels: string[] = ['Web', 'App', 'WhatsApp', 'Call Center'];
	channelData: number[] = [40, 25, 20, 15];
	notifications: any[] = [];
	channelsData: { name: string; value: number }[] = [];

	constructor(
		private route: ActivatedRoute,
			private auth: Auth,
			private userService: UserService,
			private authService: AuthService,
			private router: Router,
			private todoService: TodoService,
			private alertaService: AlertService,
			private mockService: MockDataService) {
				console.log('%c<<< Start AnalyticsComponent >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;');
			 }

	ngOnInit(): void {
		console.log('%c<<< Start ngOnInit() AnalyticsComponent >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;');
		// Initialization logic can go here
		this.mockService.getDashboardMetrics().subscribe({
			next: (data) => {
				console.log('%c<<< Datos recibidos del servicio >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;', data.metrics);
				this.metrics = data.metrics;
				console.log('%c<<< MÉTRICAS >>>', 'background:#0d6efd;color:#fff;padding:2px 5px;', this.metrics);
				this.tickets = data.chartData.tickets;
				console.log('%c<<< TICKETS >>>', 'background:#198754;color:#fff;padding:2px 5px;', this.tickets);
				this.satisfaction = data.chartData.satisfaction;
				console.log('%c<<< SATISFACCIÓN >>>', 'background:#ffc107;color:#000;padding:2px 5px;',this.satisfaction);
				this.channels = data.chartData.channel;
				console.log('%c<<< CANALES >>>', 'background:#6610f2;color:#fff;padding:2px 5px;', this.channels);
			},
			error: (err) => {
				console.error('❌ Error al obtener datos del servicio:', err);
			},
			complete: () => {
				console.log('%c<<< complete graphics data >>>', 'background: #198754; color: #ffffff; padding: 2px 5px;');
			} 
		});

		this.authService.getCurrentUser().pipe(
			switchMap(user => this.userService.getUserData(user.uid))
		).subscribe({
			next: (data) => {
				//console.log('%c<<< infoData | dashboard >>>', 'background: #198754; color: #fff; padding: 2px 5px;', data);
			},
			error: (err: Error) => {console.error('%cHTTP Error', 'background: #f8d7da; color: #842029; padding: 2px 5px;', err);},
			complete: () => {console.log('%cHTTP request completed.', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;');}
		});

		this.userService.getUserData('').subscribe(user => {
			//console.log('📥 Valor recibido desde getUserData() componente dashboard:', user); // DEBUG
      if (user) {
        this.userData = user;
				//console.log('✅ userData asignado:', this.userData); 
      } else {
        console.warn('⚠️ No hay usuario logueado. Redirigiendo a login...');
        this.router.navigate(['/login']);
      }
      this.isLoading = false;
    });
		
		this.mockService.getNotifications().subscribe(data => {
			this.notifications = data;
			console.log('📣 Notificaciones cargadas:', this.notifications);
		});
	}

}
