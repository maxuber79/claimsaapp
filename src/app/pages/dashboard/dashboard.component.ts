import { Component , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged } from '@angular/fire/auth'; 

import { Router, RouterModule } from '@angular/router';
import { Observable, Subscription, of, switchMap, tap, finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router'; // Para obtener el UID de la ruta, si aplica

/* Interfaces */
import { UserModel } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
	standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

	userData: UserModel | null = null; // o puedes usar una interfaz como UserData
  isLoading: boolean = true;
	imagePath: string = 'assets/images/isotipo-webmain.svg';
	imageDefault: string = 'https://maxuber79.github.io/gsaforce/assets/images/face28.jpg';

	user: UserModel | null = null;
	uid: string | null = null;
	profilePhotoURL: string = '';


	constructor(private route: ActivatedRoute, private auth: Auth, private userService: UserService, private authService: AuthService,private router: Router) {
		console.log('%c<<< Start DashboardComponent >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;');
	}

	/**
   * 🚀 Hook de ciclo de vida que se ejecuta al cargar el componente
   * Intenta obtener los datos del usuario autenticado desde Firestore
   */
	ngOnInit(): void {
		console.log('📦 Iniciando carga de usuario en dashboard...');
		/* this.uid = this.route.snapshot.paramMap.get('uid') || '';
		console.log('%c<<< uid | dashboard >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', this.uid); */

		this.authService.getAuthState().subscribe({
			next: (user) => {
				//console.log('%c<<< user form dashboard >>>', 'background: #198754; color: #fff; padding: 2px 5px;', user);
			},
			error: (err: Error) => {console.error('%cHTTP Error', 'background: #f8d7da; color: #842029; padding: 2px 5px;', err);},
			complete: () => {console.log('%cHTTP request completed.', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;');}
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



		//console.log('%c<<< other | dashboard >>>', 'background: #198754; color: #fff; padding: 2px 5px;', this.auth);
		onAuthStateChanged(this.auth, (user) => {
			if (user && user.uid) {
				this.userService.getUserData(user.uid).subscribe({
					next: (data) => {
						this.userData = data ? {
							...(data as UserModel),
							createdDate: data.created_at?.seconds ? new Date(data.created_at.seconds * 1000) : undefined
						} : null;
						/* this.userData = data ? {
							...(data as UserModel),
							createdDate: new Date((data.created_at?.seconds ?? 0) * 1000)
						} : null; */
						this.profilePhotoURL = user.photoURL || this.imageDefault;
						//console.log('%c<<< userData | PhotoURL >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;', this.profilePhotoURL);

						/* console.log('%c<<< info | dashboard >>>', 'background: #198754; color: #fff; padding: 2px 5px;', this.userData);
						console.log('%c<<< uid | dashboard >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', this.userData?.uid); */
						this.isLoading = false;
					},
					error: (err) => {
						console.error('Error al cargar el perfil:', err);
						this.isLoading = false;
					}
				});
			} else {
				console.warn('Usuario no autenticado');
				this.isLoading = false;
			}
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
    /* onAuthStateChanged(this.auth, async (user) => {
      if (user) {
				console.log('%c<<< info user >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;', user);
        try {
          const userData = await this.userService.getUserProfile(user.uid);
					const uid = user.uid; // 👈 Aquí está el UID del usuario autenticado
         	// ✅ Normalización manual del objeto completo
					// this.userData = {
					//	uid: userData.uid,
					//
					//	...data,
					//	 createdDate: new Date(userData.created_at.seconds * 1000) // Fecha legible
					//};  

					console.log('%c<<< userData >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;', userData);
					
					 this.userService.getUserProfile(uid).subscribe({
						next: (user) => {
							this.userData = user ?? null;
							console.log('%c[DEBUG] Datos del usuario cargados:', 'background: #0d6efd; color: white;', this.userData);
							this.loading = false;
						},
						error: (error) => {
							console.error('%c[ERROR] al cargar datos del perfil:', 'background: red; color: white;', error);
							this.loading = false;
						}
					});


        } catch (error) {
          console.error('❌ Error al obtener datos:', error);
          this.userData = null;
        }
      }
      this.loading = false;
    }); */
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
}
