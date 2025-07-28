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

		// ✅ Inicializamos el formulario con rol y status
		this.roleForm = this.fb.group({
			rol: ['', Validators.required],
			status: [false] // el switch
		});

		// ✅ Traemos el usuario seleccionado
		this.userService.getUserProfile(this.userId).subscribe((user: any) => {
			if (user) {
				this.userData = user;

				// ✅ Mapeamos activo -> status del formulario
				this.roleForm.patchValue({
					rol: user.rol || 'Ejecutivo',
					status: user.activo || false
				});

				console.log('✅ Usuario cargado para editar rol/estatus:', this.userData);
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

  // ✅ Extraemos rol y status desde el formulario
  const { rol, status } = this.roleForm.value;
  console.log('📍 Datos a guardar:', { rol, status });

  // ✅ Guardamos ambos en Firestore en paralelo
  const rolPromise = this.userService.updateUserRole(this.userData.uid, rol);
  const statusPromise = this.userService.toggleUserStatus(this.userData.uid, status);

  Promise.all([rolPromise, statusPromise])
    .then(() => {
      console.log('✅ Rol y estatus actualizados correctamente');
      this.alertService.showToastSuccess('Usuario actualizado con éxito ✅', 'Mensaje');
      this.router.navigate(['/dashboard/admin-users']);
    })
    .catch((error: any) => {
      console.error('❌ Error al actualizar rol/estatus:', error);
      this.alertService.error('Error al actualizar usuario');
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
