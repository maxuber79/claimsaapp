import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms'; 
import { Observable, Subscription, combineLatest, forkJoin, of, map, take, tap, switchMap, catchError } from 'rxjs';
import { AlertService } from '../../services/alert.service'; // o donde esté
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage'; // Importa si necesitas Firebase Storage
import { v4 as uuidv4 } from 'uuid';



import { UserModel } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
	standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {


	uid: string = '';
	//rolForm!: FormGroup; //---> V@r form
	profileForm!: FormGroup;
	//profileForm: FormGroup = new FormGroup({}); // Si no usas FormBuilder, puedes inicializarlo así
	//profileForm: FormGroup = new FormGroup({}); // Si no usas FormBuilder, puedes inicializarlo así
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

	constructor(
		private route: ActivatedRoute,
		private fb: FormBuilder,
		private userService: UserService,
		private authService: AuthService,
		private alertService: AlertService,
		private storage: Storage) {
		console.log('%c<<< Start constructor >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');

		
		
		/* this.userService.getUserData(this.uid).subscribe( response => {
			this.userData = response;
			console.log('%c[DEBUG] getProfile from authService >>', 'background: #6610f2; color: #FFFFFF; padding: 2px 5px;', this.userData);
		}); */

		/* this.profileForm = this.fb.group({
			academicoId: [{ value: '', disabled: this.isDisabled }],
			rut: [{ value: '', disabled: this.isDisabled }],
			nombre: [{ value: '', disabled: this.isDisabled }],
			email: [{ value: '', disabled: this.isDisabled }],
			funcion_ppal: [{ value: '', disabled: this.isDisabled }],
			apellido: [{ value: '', disabled: this.isDisabled }],
			status: [null],
			roles: [null]			
		}); */


	}
	ngOnInit(): void {
		console.log('%c<<< Start ngOnInit >>>', 'background: #6610f2; color: #ffffff; padding: 2px 5px;');

		
		this.uid = this.route.snapshot.paramMap.get('uid') || '';
		console.log('%c<<< uid | profile >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', this.uid);

		/**
   * Inicializa el formulario con valores vacíos
   */

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
					console.log('✅ Formulario actualizado con datos del perfil:', this.profileForm.value);					




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
		/* this.uid = this.route.snapshot.paramMap.get('uid') || '';
		console.log('%c<<< uid | profile >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', this.uid); */
		
		

	
		
	
	/**
   * 🔄 Cargar perfil del usuario desde Firestore y armar el formulario
   */


	

	
		
		// Obtener el UID desde la ruta
		/* this.route.paramMap.subscribe(params => {
			const id = params.get('id');
			if (id) {
				this.uid = id;
				console.log('🆔 UID recibido en profile:', this.uid);
				
			}
		}); */
		//this.loadUserProfile();
		//this.initializeForm();

		/* if (this.uid) {
      this.userService.getUserData(this.uid).then(data => {
				console.log('%c<<< data >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;', data);
        this.profileForm = this.fb.group({
          name: [data.name],
          last_name: [data.last_name],
          user_name: [data.user_name],
          email: [{ value: data.email, disabled: true }],
          phone: [data.phone],
          mobile: [data.mobile],
          address: [data.address],
          city: [data.city],
          commune: [data.commune],
          profession: [data.profession],
          website: [data.website],
          github: [data.github],
          instagram: [data.instagram],
          twitter: [data.twitter],
          facebook: [data.facebook],
          bio: [data.bio]
        });

				if (!this.editMode) this.profileForm.disable();
        this.loading = false;
				 

				
      }).catch(err => {
        console.error('Error al cargar el perfil:', err);
				this.loading = false;
      });
    } */
		/* this.route.params.subscribe(params => {
			this.uid = params['uid'];
			this.loadUserData(this.uid);
		});  */

		
	}
/* 
	this.userService.getUserProfile(this.uid).subscribe(user => {
		console.log('🧠 userData desde loadUserProfile:', user);
		if (user) {
			this.userData = user;
			console.log('✅ Perfil cargado despues del if:', this.userData);		 
		} else {
			console.warn('⚠️ No se encontró perfil para UID:', this.uid);
		}
	}); */
	
	

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

	onFileSelected(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			const localUrl = URL.createObjectURL(file);
			this.previewUrl = localUrl; // Para mostrar
			this.imageFile = file;      // Para guardar si lo necesitas
			this.fileName = `avatar_${Date.now()}_${file.name}`;
		}
	}
	

	/* onFileSelected(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			const reader = new FileReader();
	
			reader.onload = () => {
				this.previewUrl = reader.result;
				// Acá puedes guardar en Firestore o Firebase Storage si quieres
			};
	
			reader.readAsDataURL(file);
		}
	} */
		 

		/* onFileSelected(event: Event): void {
			const input = event.target as HTMLInputElement;
			if (!input.files || input.files.length === 0) return;
		
			const file = input.files[0];
			const filePath = `avatars/${uuidv4()}_${file.name}`;
			const fileRef = ref(this.storage, filePath);
		
			uploadBytes(fileRef, file)
				.then(snapshot => getDownloadURL(snapshot.ref))
				.then(downloadURL => {
					this.previewUrl = downloadURL;
		
					// Obtener UID actual
					this.authService.getCurrentUser().subscribe(user => {
						if (user?.uid) {
							this.userService.updateUserProfile(user.uid, {
								photoURL: downloadURL
							}).subscribe(() => {
								console.log('✅ Imagen guardada en Firestore con URL:', downloadURL);
								this.alertService.success('Imagen guardada en Firestore con URL:');
							});
						}
					});
				})
				.catch(error => {
					console.error('❌ Error al subir imagen:', error);
				});
		} */
		

	/**
   * 🧱 Construir el formulario reactivo con los datos del usuario
   */
	
	/* 	
	Esta sección es un ejemplo de cómo podrías construir un formulario reactivo con datos ficticios.
	esta funcionando con datos de ejemplo, pero deberías reemplazarlo con los datos reales del usuario.
	profileForm = new FormGroup({
		name: new FormControl('lorem ipsum'),
		last_name:new FormControl('lorem ipsum'),
		user_name: new FormControl('lorem ipsum'),
		email: new FormControl('lorem ipsum'),
		phone: new FormControl('lorem ipsum'),
		mobile: new FormControl('lorem ipsum'),
		address: new FormControl('lorem ipsum'),
		city: new FormControl('lorem ipsum'),
		commune: new FormControl('lorem ipsum'),
		profession: new FormControl('lorem ipsum'),
		website: new FormControl('lorem ipsum'),
		github: new FormControl('lorem ipsum'),
		instagram: new FormControl('lorem ipsum'),
		twitter: new FormControl('lorem ipsum'),
		facebook:new FormControl('lorem ipsum'),
		bio: new FormControl('lorem ipsum')
	}); */






 buildForm(user: UserModel): void { 

	/*  this.profileForm = new FormGroup({
		name: new FormControl('lorem ipsum'),
		last_name:new FormControl('lorem ipsum'),
		user_name: new FormControl('lorem ipsum'),
		email: new FormControl('lorem ipsum'),
		phone: new FormControl('lorem ipsum'),
		mobile: new FormControl('lorem ipsum'),
		address: new FormControl('lorem ipsum'),
		city: new FormControl('lorem ipsum'),
		commune: new FormControl('lorem ipsum'),
		profession: new FormControl('lorem ipsum'),
		website: new FormControl('lorem ipsum'),
		github: new FormControl('lorem ipsum'),
		instagram: new FormControl('lorem ipsum'),
		twitter: new FormControl('lorem ipsum'),
		facebook:new FormControl('lorem ipsum'),
		bio: new FormControl('lorem ipsum')
	});  */
     /* this.profileForm = this.fb.group({
			name: [this.userData!.name, Validators.required],
			last_name: [this.userData!.last_name, Validators.required],
			user_name: [this.userData!.user_name],
			email: [{ value: this.userData!.email, disabled: true }],
			phone: ['Lorem Ipsun dolor'],
			mobile: ['Lorem Ipsun dolor'],
			address: ['Lorem Ipsun dolor'],
			city: ['Lorem Ipsun dolor'],
			commune: ['Lorem Ipsun dolor'],
			profession: ['Lorem Ipsun dolor'],
			website: ['Lorem Ipsun dolor'],
			github: ['Lorem Ipsun dolor'],
			instagram: ['Lorem Ipsun dolor'],
			twitter: ['Lorem Ipsun dolor'],
			facebook: ['Lorem Ipsun dolor'],
			bio: ['Lorem Ipsun dolor']	 
    }); */
  }  
/* 	toggleEdit(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.profileForm.enable();
      this.profileForm.get('email')?.disable();
    } else {
      this.profileForm.disable();
    }
  } */

 /*  saveChanges(): void {
    if (this.profileForm.valid && this.uid) {
      const updatedData: UserModel = {
        ...this.profileForm.getRawValue(),
        uid: this.uid
      };

      this.userService.updateUserData(this.uid, updatedData).then(() => {
        this.toggleEdit();
        alert('✅ Perfil actualizado correctamente');
      }).catch(err => {
        console.error('❌ Error al actualizar perfil:', err);
      });
    }
  } */

		/**
   * 🔄 Cargar perfil del usuario desde Firestore y armar el formulario
   */
		/* loadUserProfile(uid: string): void {
			this.userService.getUserProfile(uid).subscribe(user => { 
				console.log('✅ Perfil cargado desde profile:', user);
			});
		}
 */
		/* private initializeForm(): void {
			this.profileForm = this.fb.group({
				uid: [{ value: '', disabled: true }], // UID no editable
				email: ['', [Validators.required, Validators.email]],
				name: [''],
				last_name: [''],
				bio: [''],
				user_name: [''],
				surnames: [''],
				mobile: [''],
				phone: [''],
				address: [''],
				city: [''],
				commune: [''],
				profession: [''],
				photoURL: [''],
				website: [''],
				github: [''],
				instagram: [''],
				twitter: [''],
				facebook: [''],
				// created_at y createdDate no se incluyen en el formulario para edición directa
				// pero se pueden mostrar.
			});
		} */

		/**
   * 💾 Guardar los cambios del perfil en Firestore
   */
		/* saveProfile(): void {
			console.log('📝 Guardando perfil...' );
		} */
		 /* saveProfile(): void {
			if (this.profileForm.valid && this.userData?.uid) {
				const updatedData: Partial<UserModel> = this.profileForm.getRawValue();
				this.userService.updateUserProfile(this.userData.uid, updatedData).subscribe(() => {
					console.log('✅ Perfil actualizado correctamente');
					this.editMode = false;
				});
			} else {
				console.warn('❌ Formulario inválido o UID faltante');
			}
		}   */
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
			

		/**
   * 🔄 Alternar entre modo edición y solo lectura
   */
		/* toggleEdit(): void {
			this.editMode = !this.editMode;
			console.log(this.editMode ? '📝 Modo edición activado' : '👀 Modo lectura activado');
		} */
		toggleEdit(): void {
			if (this.editMode && this.perfil) {
				// Si cancela edición, restablecer valores originales
				this.profileForm.patchValue(this.perfil); // asumimos que ya tenés perfil cargado
			}
			this.editMode = !this.editMode;
		}
}
