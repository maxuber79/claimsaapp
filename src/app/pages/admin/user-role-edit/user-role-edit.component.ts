import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule  } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { UserModel } from '../../../models/user';
import { AlertService } from '../../../services/alert.service';


@Component({
  selector: 'app-user-role-edit',
	standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-role-edit.component.html',
})
export class UserRoleEditComponent implements OnInit {
  roleForm!: FormGroup;
  userId!: string;
  userData!: UserModel;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,		
    private alertService: AlertService 
  ) {}

  ngOnInit(): void {
     this.userId = this.route.snapshot.paramMap.get('uid') || '';
		 console.log('📍 UID capturado desde ruta:', this.userId);

		 if (!this.userId) {
      console.warn('⚠️ No se pudo obtener el UID desde la URL');
      return;
    }
		this.roleForm = this.fb.group({
      rol: ['', Validators.required],
    });

    this.userService.getUserProfile(this.userId).subscribe( (user:any) => {
			if (user) {
				this.userData = user;
				this.roleForm.patchValue({ rol: user.rol || 'Ejecutivo' });
			} else {
				console.warn('⚠️ Usuario no encontrado con UID:', this.userId);
			}
		});
		
  }

  get rol() {
		return this.roleForm.get('rol');
	}

	onSubmit() {
		if (this.roleForm.invalid || !this.userData?.uid) {
			console.warn('⚠️ Formulario inválido o UID no disponible.');
			return;
		}
		const nuevoRol = this.roleForm.value.rol;
		console.log('📍 Rol seleccionado:', this.roleForm.value);

		this.userService.updateUserRole(this.userData.uid, nuevoRol)
    .then(() => {
      console.log('✅ Rol actualizado correctamente');       
			this.alertService.showToastSuccess('Rol actualizado con éxito', 'Mensaje');
      this.router.navigate(['/dashboard/admin-users']);
    })
    .catch((error: any) => {
      console.error('❌ Error al actualizar el rol:', error);
      this.alertService.error('Error al actualizar rol');
    });
	}

  /* onSubmit() {
    if (this.roleForm.valid) {
      const nuevoRol = this.roleForm.value.rol;
      this.userService.updateUserRole(this.userId, nuevoRol).then(() => {
        alert('Rol actualizado correctamente');
        this.router.navigate(['/dashboard/user-management']);
      });
    }
  } */
}
