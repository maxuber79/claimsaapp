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
  selector: 'app-profile-edit',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss'
})
export class ProfileEditComponent implements OnInit {
	
	
	uid: string = '';
	profileEditUserForm!: FormGroup; 
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

  // 1️⃣ Inicializamos el formulario vacío ANTES de cargar datos
  this.profileEditUserForm = this.fb.group({
    uid: [{ value: '', disabled: true }],  // UID no editable
    email: [{ value: '', disabled: true }], // Email no editable
    photoURL: [''],
    name: [''],
    last_name: [''],
    user_name: [''],
		username: [''],
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

  // 2️⃣ Obtenemos el UID desde la URL (enviado desde AdminUserManagementComponent)
  const routeUid = this.route.snapshot.paramMap.get('uid');
  console.log('%c<<< UID recibido desde ruta >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', routeUid);

  if (!routeUid) {
    console.error('❌ No se recibió UID en la ruta, no se puede cargar el usuario');
    return; // 🚫 No seguimos si no hay UID
  }

  // Guardamos el UID para reutilizarlo (por ejemplo en saveProfile)
  this.uid = routeUid;
  this.isLoading = true;

  // 3️⃣ Traemos los datos del usuario por UID (⚠️ usando getUserProfile, NO getUserData)
  this.userService.getUserProfile(this.uid).subscribe({
    next: (user) => {
      if (!user) {
        console.warn('⚠️ No se encontró información para UID:', this.uid);
        this.isLoading = false;
        return;
      }

      // ✅ Guardamos el usuario en las variables del componente
      this.userData = user;
      this.perfil = { ...user }; // Copia para restablecer si cancela edición
      this.isLoading = false;

      console.log('%c✅ Usuario cargado correctamente >>>', 'background: #198754; color: #fff; padding: 2px 5px;', this.userData);

      // 4️⃣ Actualizamos el formulario con los datos recibidos
      this.profileEditUserForm.patchValue({
        uid: this.userData.uid || '',
        email: this.userData.email || '',
        photoURL: this.userData.photoURL || '',
        name: this.userData.name || '',
        last_name: this.userData.last_name || '',
        user_name: this.userData.user_name || '',
        username: this.userData.username || 'n/a',
        phone: this.userData.phone || '',
        mobile: this.userData.mobile || '',
        address: this.userData.address || '',
        city: this.userData.city || '',
        commune: this.userData.commune || '',
        profession: this.userData.profession || '',
        website: this.userData.website || '',
        github: this.userData.github || '',
        instagram: this.userData.instagram || '',
        twitter: this.userData.twitter || '',
        facebook: this.userData.facebook || '',
        bio: this.userData.bio || ''
      });

      console.log('%c<<< Formulario patchValue >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', this.profileEditUserForm.value);
    },
    error: (err) => {
      console.error('❌ Error al cargar usuario desde Firestore:', err);
      this.isLoading = false;
    }
  });
}



	toggleEdit() {
		this.editMode = !this.editMode;
		this.isDisabled = !this.isDisabled;
		console.log('%c<<< Modo edición >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', this.editMode);
	}
	saveProfile(): void {
  console.log('%c<<< Guardar perfil >>>', 'background: #0d6efd; color: #fff; padding: 2px 5px;', this.profileEditUserForm.value);

  // 1️⃣ Validar formulario
  if (this.profileEditUserForm.invalid) {
    this.alertService.error('⚠️ El formulario es inválido. Revisa los campos.');
    this.profileEditUserForm.markAllAsTouched(); // Marca todos como "touched" para mostrar errores
    return;
  }

  // 2️⃣ Obtener los datos del formulario
  const updatedData = this.profileEditUserForm.getRawValue(); 
  console.log('%c<<< Datos a actualizar >>>', 'background: #d1e7dd; color: #0f5132; padding: 2px 5px;', updatedData);

  // 3️⃣ Verificar que tengamos UID válido
  if (!this.uid) {
    this.alertService.error('❌ No se encontró UID para actualizar.');
    return;
  }

  this.isSaving = true; // Activamos loader
  console.log('🔄 Guardando cambios en Firestore para UID:', this.uid);

  // 4️⃣ Guardar en Firestore
  this.userService.updateUserProfile(this.uid, updatedData).subscribe({
    next: () => {
      console.log('%c✅ Perfil actualizado correctamente', 'background: #198754; color: #fff; padding: 2px 5px;');
      this.alertService.success('Perfil actualizado correctamente ✅');

      // 5️⃣ Actualizar la copia original para cancelar edición sin perder datos
      this.perfil = { ...this.perfil, ...updatedData };
      this.isSaving = false;

      // Si quieres salir del modo edición
      this.editMode = false;
    },
    error: (err) => {
      console.error('%c❌ Error al actualizar perfil:', 'background: #f8d7da; color: #842029; padding: 2px 5px;', err);
      this.alertService.error('❌ Error al guardar perfil, revisa la consola');
      this.isSaving = false;
    }
  });
}


	onFileSelected(event: Event) {
		const fileInput = event.target as HTMLInputElement;
		if (fileInput.files && fileInput.files.length > 0) {
			this.imageFile = fileInput.files[0];
			this.fileName = this.imageFile.name;

			const reader = new FileReader();
			reader.onload = (e) => {
				this.previewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(this.imageFile);
		}
	}
}
