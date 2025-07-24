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
  
	
	uid: string = ''; 
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
		console.log('%c<<< Start ngOnInit >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');
  
	
	const routeUid = this.route.snapshot.paramMap.get('uid');
	console.log('%c<<< UID desde la ruta >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', routeUid);



  if (!routeUid) {
    console.error('❌ No se encontró UID en la ruta');
    return; // salimos para evitar llamadas inválidas
  }

	//Inicializamos el formulario
	this.profileUserForm = this.fb.group({
			uid: [{ value: '', disabled: true }], // UID no editable
			email: [{ value: '', disabled: true }], // Email no editable
			photoURL: [''],// opcional
			name: [''],
			last_name: [''],
			user_name: [''],			
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
  this.uid = routeUid; // ahora ya es string seguro

  this.userService.getUserData(this.uid).subscribe({
    next: (user) => {
      this.userData = { ...user, uid: this.uid, email: user?.email ?? '' }; 
      this.perfil = { ...user, uid: this.uid, email: user?.email ?? '' };
      this.isLoading = false;

      console.log('✅ Usuario cargado:', this.userData);

      this.profileUserForm.patchValue({
				uid: this.perfil?.uid || '', // UID no editable
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
    complete: () => {
      console.log('%c<<< Usuario cargado correctamente >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;');
    }
  });
}


	initForm(): void {
	
	}

	onFileSelected(event: Event) {
		 
	}

	/**
   * 🔄 Cargar perfil del usuario desde Firestore y armar el formulario
   */
	loadUserProfile(uid: string): void {
		console.log('%c<<< Start loadUserProfile >>>', 'background: #198754; color: #ffffff; padding: 2px 5px;');
	} 

	saveProfile(): void {
		console.log('Guardar perfil');
		console.log('%c<<< Guardar perfil >>>', 'background: #0d6efd; color: #fff; padding: 2px 5px;');

		if (this.profileUserForm.invalid) {
			alert('⚠️ El formulario es inválido. Revisa los campos.');
			return;
		}

		const updatedData = this.profileUserForm.value;
  	const uid = this.uid;
		console.log('%c<<< uid >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', uid);
		console.log('%c<<< Datos a guardar >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', updatedData);

		 this.userService.updateUserProfile(this.uid, updatedData).subscribe({
			next: () => {
					console.log('%c✅ Perfil actualizado correctamente', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;');
				this.alertService.success('Perfil actualizado correctamente');
				this.toggleEdit(); // salir de modo edición
			},
			error: (err) => {
				console.error('%c❌ Error al actualizar perfil:', 'background: #f8d7da; color: #842029; padding: 2px 5px;', err);
				this.alertService.error('❌ Error al guardar perfil, revisa la consola');
			}
  	});  
	}  
	 
	toggleEdit(): void { 
		if (this.editMode && this.perfil) {
			// Si cancela edición, restablecer valores originales
			this.profileUserForm.patchValue(this.perfil); 
		}
		this.editMode = !this.editMode;
	} 

}
