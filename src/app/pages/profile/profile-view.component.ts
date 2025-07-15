import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { Observable, Subscription, combineLatest, forkJoin, of, map, take, tap, switchMap, catchError } from 'rxjs';
import { AlertService } from '../../services/alert.service'; // o donde esté
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage'; // Importa si necesitas Firebase Storage
import { v4 as uuidv4 } from 'uuid';
import { Router, RouterModule } from '@angular/router';

import { UserModel } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile-view',
	standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.scss'
})
export class ProfileViewComponent implements OnInit {
  
	
	uid: string | null = ''; 
	profileForm!: FormGroup;
	profileUserForm!: FormGroup; 
	userData: UserModel | null = null; 
  editMode: boolean = false; // Cambia a true si quieres que el formulario esté en modo edición por defecto
	isDisabled: boolean = false; // Cambia a true si quieres que el formulario esté deshabilitado por defecto
	loadUserData: any;
	loading: boolean = true;
	isSaving: boolean = false;
	isLoading: boolean = true;
	defaultImage = 'https://randomuser.me/api/portraits/men/40.jpg'; // Imagen por defecto

	previewUrl: string | null = null;
	imageFile: File | null = null;
	fileName: string = '';

	perfil: UserModel | null = null; 
	config: any | null = null; 

  constructor ( 
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private userService: UserService,
		private authService: AuthService,
		private alertService: AlertService,
		private storage: Storage
	) {
		console.log('%c<<< Start constructor >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');
	}

  ngOnInit(): void {
		console.log('%c<<< Start ngOnInit >>>', 'background: #6610f2; color: #ffffff; padding: 2px 5px;');

		//this.uid = this.route.snapshot.paramMap.get('uid') || '';
		this.uid = this.route.parent?.snapshot.paramMap.get('uid') || '';
		console.log('%c<<< uid | profile >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', this.uid);

		this.profileForm = this.fb.group({
			uid: [{ value: this.uid, disabled: true }], // UID no editable
			photoURL: [''],// opcional
			name: [''],
			last_name: [''],
			user_name: [''],
			email: [{ value: '', disabled: true }], // UID no editable
			phone: [''],
			mobile: [''],
			address: [''],
			city: [''],
			commune: [''],
			profession: [''],
			website: [''],
			github: [''],
			instagram: [''],
			twitter: [''],
			facebook: [''],
			bio: ['']
		});

		this.profileUserForm = this.fb.group({
			uid: [{ value: this.uid, disabled: true }], // UID no editable
			photoURL: [''],// opcional
			name: [''],
			last_name: [''],
			user_name: [''],
			email: [{ value: '', disabled: true }], // UID no editable
			phone: [''],
			mobile: [''],
			address: [''],
			city: [''],
			commune: [''],
			profession: [''],
			website: [''],
			github: [''],
			instagram: [''],
			twitter: [''],
			facebook: [''],
			bio: ['']
		});
		console.log('%c<<< Formulario inicializado >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', this.profileUserForm);

		this.route.parent?.paramMap.subscribe( params => {
			this.uid = params.get('uid') || '';
			console.log('%c<<< uid | profile-view >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', this.uid);
		});
     

			
			 
			this.userService.getUserData(this.uid ?? '').subscribe({
				next: (user) => {
					this.userData = user; 
					this.perfil = user;
					this.isLoading = false;
					console.log('✅ Usuario cargado:', user);
				
					this.profileForm.patchValue({
						photoURL: this.perfil?.photoURL || '',
						name: this.perfil?.name || '',
						last_name: this.perfil?.last_name || '',
						user_name: this.perfil?.user_name || '',
						email: this.perfil?.email || '',
						phone: this.perfil?.phone || '',
						mobile: this.perfil?.mobile || '',
						address: this.perfil?.address || '',
						city: this.perfil?.city || '',
						commune: this.perfil?.commune || '',
						profession: this.perfil?.profession || '',
						website: this.perfil?.website || '',
						github: this.perfil?.github || '',
						instagram: this.perfil?.instagram || '',
						twitter: this.perfil?.twitter || '',
						facebook: this.perfil?.facebook || '',
						bio: this.perfil?.bio || ''
					});
					this.profileUserForm.patchValue({
						photoURL: this.perfil?.photoURL || '',
						name: this.perfil?.name || '',
						last_name: this.perfil?.last_name || '',
						user_name: this.perfil?.user_name || '',
						email: this.perfil?.email || '',
						phone: this.perfil?.phone || '',
						mobile: this.perfil?.mobile || '',
						address: this.perfil?.address || '',
						city: this.perfil?.city || '',
						commune: this.perfil?.commune || '',
						profession: this.perfil?.profession || '',
						website: this.perfil?.website || '',
						github: this.perfil?.github || '',
						instagram: this.perfil?.instagram || '',
						twitter: this.perfil?.twitter || '',
						facebook: this.perfil?.facebook || '',
						bio: this.perfil?.bio || ''
					});
					console.log('%c<<< Formulario patchValue >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', this.profileUserForm.value);
				
				
				
				
				},
				error: (err) => {
					console.error('❌ Error al cargar usuario:', err);
					this.isLoading = false;
				},
				complete() {
					console.log('%c<<< Usuario cargado correctamente >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;');					 
				},
			});
		

		if (this.uid) {
			console.log('🆔 UID recibido en profile:', true, 'uid:',this.uid);
			// obtener datos desde el servicio usando el uid

			combineLatest({
				perfil: this.userService.getUserData(this.uid),
				config: this.authService.getCurrentUser().pipe(take(1)) // aseguramos un valor único del usuario
			}).subscribe({
				next: ({ perfil, config }) => {
					this.perfil = perfil;
					this.config = config;
					console.log('✅ combineLatest:', { perfil, config });

										




				},
				error: (err) => {
					console.error('❌ Error al obtener datos del perfil/config:', err);
				}
			});

			/* this.userService.getUserData(this.uid).subscribe({
				next: (perfil) => {
					this.perfil = perfil;
					console.log('✅ Perfil cargado:', perfil);
				},
				error: (err) => console.error('❌ Error en getUserData:', err)
			});
			
			this.AuthService.getCurrentUser().pipe(take(1)).subscribe({
				next: (config) => {
					this.config = config;
					console.log('✅ Usuario autenticado:', config);
				},
				error: (err) => console.error('❌ Error en getCurrentUser:', err)
			}); */
			

			/* forkJoin({
				perfil: this.userService.getUserData(this.uid).pipe(take(1)),
				config: this.AuthService.getCurrentUser()
			}).subscribe({
				next: ({ perfil,config }) => {
					this.perfil = perfil;
					console.info('<< Perfil >>', this.perfil); 
					this.config = config;
					console.info('<< Config >>', this.config);
				},
				error: (err: Error) => {console.error('%cHTTP Error', 'background: #f8d7da; color: #842029; padding: 2px 5px;', err);},
				complete: () => {console.log('%cHTTP request completed.', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;');}
				 
			}); */
		}

		
	}

	onFileSelected(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const localUrl = URL.createObjectURL(file);
			this.previewUrl = localUrl; // Para mostrar
			this.imageFile = file;      // Para guardar si lo necesitas
			this.fileName = `avatar_${Date.now()}_${file.name}`;
		}
	}

	/**
   * 🔄 Cargar perfil del usuario desde Firestore y armar el formulario
   */
	loadUserProfile(uid: string): void {
		this.userService.getUserProfile(uid).subscribe(user => {
			console.log('🧠 userData desde loadUserProfile:', user);
			if (user) {
				this.userData = user;
				console.log('✅ Perfil cargado despues del if:', this.userData); 
			} else {
				console.warn('⚠️ No se encontró perfil para UID:', uid);
			}
		});
	} 

	saveProfile(): void {
		if (this.profileForm.valid && this.uid) {
			const updatedData = this.profileForm.getRawValue(); // incluye los campos deshabilitados como email
	
			this.userService.updateUserProfile(this.uid, updatedData).subscribe({
				next: () => {
					console.log('%c✅ Perfil actualizado correctamente', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;');
					this.alertService.success('Perfil actualizado correctamente');
					this.perfil = updatedData; // opcional: actualiza el modelo local
					this.editMode = false;
				},
				error: (err) => {
					console.error('%c❌ Error al actualizar perfil:', 'background: #f8d7da; color: #842029; padding: 2px 5px;', err);
				}
			});
		}
	}
	toggleEdit(): void {
		if (this.editMode && this.perfil) {
			// Si cancela edición, restablecer valores originales
			this.profileForm.patchValue(this.perfil); // asumimos que ya tenés perfil cargado
		}
		this.editMode = !this.editMode;
	}

}
