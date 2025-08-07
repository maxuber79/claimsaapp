// Importaciones necesarias de Angular y RxJS
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

// Importaciones de Firebase y RxJS para operaciones asíncronas
import { Observable, EMPTY, Subscription } from 'rxjs';
import { catchError, map, switchMap, filter } from 'rxjs/operators';

// Modelos de datos
import { Claim } from '../../../models/claims';
import { UserModel } from '../../../models/user';
import { UserNotification } from '../../../models/UserNotification.model';
// Servicios
import { ClaimsService } from '../../../services/claims.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/user.service';
import { MockDataService } from '../../../services/mock-data.service';
import { CardMetricComponent } from '../../dashboard/components/card-metric.component';
import { NotificationService } from '../../../services/notification.service';


@Component({
  selector: 'app-executive-claims',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
		CardMetricComponent
  ],
  templateUrl: './executive-claims.component.html',
  styleUrl: './executive-claims.component.scss'
})
export class ExecutiveClaimsComponent implements OnInit, OnDestroy {
  // Propiedades del componente
  executiveClaims: Claim[] = []; // Contiene TODOS los reclamos del ejecutivo
  filteredClaims: Claim[] = []; // Contiene los reclamos después de aplicar filtros
	userData: UserModel | null = null; // o puedes usar una interfaz como UserData
	
  isLoading: boolean = true;
  errorMessage: string | null = null;
  claimForm!: FormGroup; // Formulario reactivo
  isEditing: boolean = false;
  showModal: boolean = false;
	isViewOnly: boolean = true; // Solo lectura por defecto
  private subscriptions: Subscription = new Subscription();


  selectedClaim: Claim | null = null;
	currentUserUid: string | null = null; // UID del ejecutivo actual

  private TEST_EXECUTIVE_UID = 'KVDf8PfHEWMdic0SQPcxFMizoBf2'; // UID de prueba para desarrollo

	// Propiedades para paginación y filtros
	searchTerm: string = ''; // Búsqueda por nombre
  filterStatus: string = 'Todos'; // Filtro por estado, 'Todos' por defecto


  // Propiedades para selección
  masterChecked: boolean = false;
  showDeleteButton: boolean = false; 
  currentPage: number = 1;
  itemsPerPage: number = 10; // Mostrar 10 ítems por página inicialmente
  pagedClaims: Claim[] = []; // Contiene los reclamos de la página actual
	 

	//Propiedades metrics


  imagePath: string = 'assets/images/isotipo-webmain.svg';
	imageDefault: string = 'https://maxuber79.github.io/gsaforce/assets/images/face28.jpg';

 metrics: any[] = [
  {
    label: 'Total Claims',
    icon: 'bi-list',
    count: 0,
    color: 'primary',
    footerText: 'Actualizado en tiempo real',
    trendIcon: 'bi-arrow-repeat'
  },
  {
    label: 'Pendientes',
    icon: 'bi-hourglass',
    count: 0,
    color: 'warning',
    footerText: 'Revisar cuanto antes',
    trendIcon: 'bi-hourglass-split'
  },
  {
    label: 'Cerrados',
    icon: 'bi-check-circle',
    count: 0,
    color: 'success',
    footerText: 'Resueltos con éxito',
    trendIcon: 'bi-check2'
  },
  {
    label: 'Cancelados',
    icon: 'bi-x-circle',
    count: 0,
    color: 'danger',
    footerText: 'No continuaron',
    trendIcon: 'bi-x'
  }
];

  constructor(
    private fb: FormBuilder,
    private claimsService: ClaimsService,
    private authService: AuthService,
    private alert: AlertService,
    private userService: UserService,
		private mockService: MockDataService,
		private notificationService: NotificationService 
  ) {}

  // Método que se ejecuta al inicializar el componente
 ngOnInit(): void {
  this.initializeForm();

  this.authService.getAuthState().subscribe(user => {
    if (user) {
      this.currentUserUid = user.uid;
      console.log(`🔐 Usuario autenticado: ${user.email} (UID: ${this.currentUserUid})`);

      this.userService.getUserData(this.currentUserUid).subscribe({
        next: (userData: UserModel | null) => {
          this.userData = userData || null;
          console.log('%c<<< userData | executive >>>', 'background: #198754; color: #fff;', this.userData);

          if (this.userData && this.userData.uid) {
            // ✅ 1) Trae métricas
            this.claimsService.getUserClaims(this.userData.uid).subscribe((claims: Claim[]) => {
              this.updateMetrics(claims);
              console.log('%c<<< claims para métricas >>>', 'background: #198754; color: #fff;', claims);
            });

            // ✅ 2) Carga los reclamos de la tabla
            this.loadExecutiveClaims(this.userData.uid);
          } else {
            console.warn('⚠️ No se encontró userData.uid, no se cargan reclamos');
          }
        },
        error: (err: Error) => {
          console.error('❌ Error al obtener datos del usuario:', err);
        }
      });
    }
  });
}


	/**
   * 🔄 Actualiza las métricas según el estado de los reclamos
   */
  private updateMetrics(claims: Claim[]): void {
    const total = claims.length;
    const pending = claims.filter(c => c.estado === 'Pendiente' || c.estado === 'Iniciado').length;
    const closed = claims.filter(c => c.estado === 'Cerrado').length;
    const cancelled = claims.filter(c => c.estado === 'Cancelado').length;

    // ✅ Actualizamos los valores en el array para que se refleje en el HTML
    this.metrics[0].count = total;
    this.metrics[1].count = pending;
    this.metrics[2].count = closed;
    this.metrics[3].count = cancelled;
  }

  // Método para inicializar/resetear el formulario
  initializeForm(claim?: Claim): void {
    this.claimForm = this.fb.group({
      id: [claim?.id || null],
      nombre: [claim?.nombre || '', Validators.required],
      tipo: [claim?.tipo || ''],
      detail: [claim?.detail || ''],
      estado: [claim?.estado || 'Pendiente', Validators.required],
      fecha: [claim?.fecha || new Date().toISOString().split('T')[0], Validators.required],
      uidEjecutivo: [claim?.uidEjecutivo || this.TEST_EXECUTIVE_UID]
    });
  }

  // Carga los reclamos del ejecutivo actual (o el UID de prueba)
  loadExecutiveClaims(uid: string): void {
  this.isLoading = true;
  this.errorMessage = null;

  const sub = this.claimsService.getClaimsByUid(uid).pipe(
    map(claims => claims.map(c => ({ ...c, selected: false }))),
    catchError(error => {
      console.error('❌ Error al cargar reclamos del ejecutivo:', error);
      this.errorMessage = 'No se pudieron cargar los reclamos. Inténtalo de nuevo más tarde.';
      this.isLoading = false;
      return EMPTY;
    })
  ).subscribe({
    next: (claims: Claim[]) => {
      this.executiveClaims = claims;
      this.isLoading = false;
      console.log('✅ Reclamos del ejecutivo cargados:', this.executiveClaims);
      this.updateDeleteButtonState();
      this.masterChecked = false;
      this.applyFilters(); // Actualiza paginación y filtros
    },
  });

  this.subscriptions.add(sub);
}


  // Aplica los filtros de búsqueda y estado a los reclamos
  applyFilters(): void {
    let tempClaims = [...this.executiveClaims]; // Clona la lista completa

    // Filtro por nombre
    if (this.searchTerm) {
      tempClaims = tempClaims.filter(claim =>
        claim.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (this.filterStatus && this.filterStatus !== 'Todos') {
      tempClaims = tempClaims.filter(claim =>
        claim.estado === this.filterStatus
      );
    }

    this.filteredClaims = tempClaims; // Actualiza la lista filtrada
    this.currentPage = 1; // Reinicia a la primera página con los nuevos filtros
    this.updatePagedClaims(); // Actualiza la vista paginada
  }

  // Abre el modal de edición/visualización de un reclamo
  viewClaim(claim: Claim): void {
    this.selectedClaim = { ...claim };
    this.initializeForm(this.selectedClaim);
    this.isEditing = false;
    this.claimForm.disable(); // El formulario se deshabilita por defecto en modo vista
    this.showModal = true;
    console.log(`🔍 Reclamo seleccionado para ver/editar:`, this.selectedClaim);
  }

  // Habilita la edición en el formulario del modal
  enableEdit(): void {
    this.isEditing = true;
    this.claimForm.enable(); // Se habilita el formulario para edición
    this.claimForm.get('id')?.disable(); // El ID no debe ser editable
    this.claimForm.get('uidEjecutivo')?.disable(); // El UID del ejecutivo no debe ser editable
  }

  // Guarda los cambios del reclamo (actualiza en Firestore)
  saveChanges(): void {
    if (this.isEditing && this.claimForm.valid && this.selectedClaim) {
      this.isLoading = true;
      // Se usa getRawValue() para incluir los campos deshabilitados (id, uidEjecutivo)
      const updatedClaim: Claim = {
        id: this.selectedClaim.id,
        uidEjecutivo: this.selectedClaim.uidEjecutivo || this.TEST_EXECUTIVE_UID,
        ...this.claimForm.getRawValue()
      };

      this.claimsService.updateClaim(updatedClaim.uidEjecutivo!, updatedClaim)
        .then(() => {
          this.alert.success('✅ Reclamo actualizado con éxito.');

					// 📢 Enviar notificación a todos los administradores
					this.notificationService.sendToAdmins(
						/* `El ejecutivo <strong>${this.userData?.user_name || 'Desconocido'}</strong> actualizó el reclamo #${updatedClaim.id}`,
						'admin-alert' */
						`El ejecutivo <strong>${this.userData?.user_name}</strong> ha <strong>modificado</strong> el reclamo <strong>#${updatedClaim.id}</strong>.`,
						'admin-alert'
					);

          this.cancelEdit(); // Cierra el modal y resetea
          this.loadExecutiveClaims(updatedClaim.uidEjecutivo!); // ✅ usa el UID del reclamo
        })
        .catch(err => {
          console.error('❌ Error actualizando reclamo:', err);
          this.alert.error('Ocurrió un error al actualizar el reclamo. Inténtalo de nuevo.');
          this.isLoading = false;
        });
    } else if (!this.isEditing) {
      this.alert.showToastInfo('Haz clic en "Habilitar Edición" para modificar el reclamo.', 'Modo de Solo Lectura');
    } else {
      this.claimForm.markAllAsTouched(); // Marca todos los campos como "tocados" para mostrar validación
      this.alert.showToastError('Por favor, completa todos los campos requeridos.', 'Formulario inválido');
    }
  }

  // Cierra el modal y resetea el reclamo seleccionado y el formulario
  cancelEdit(): void {
    this.showModal = false;
    this.selectedClaim = null;
    this.claimForm.reset();
    this.errorMessage = null;
    this.isEditing = false;
  }

  // Helper para obtener FormControl por nombre (facilita la validación en HTML)
  getFormControl(name: string): FormControl {
    return this.claimForm.get(name) as FormControl;
  }

  // Métodos para selección masiva y eliminación
  toggleMasterCheckbox(): void {
    this.masterChecked = !this.masterChecked;
    // Asegurarse de que `executiveClaims` se esté actualizando correctamente si la fuente es `pagedClaims`
    // En este caso, el checkbox maestro afecta a TODOS los reclamos, no solo a los de la página actual
    this.executiveClaims.forEach(claim => claim.selected = this.masterChecked);
    this.updateDeleteButtonState();
  }

  toggleClaimSelection(claim: Claim): void {
    claim.selected = !claim.selected;
    // Actualiza el estado del checkbox maestro si todos los reclamos están seleccionados
    this.masterChecked = this.executiveClaims.every(c => c.selected);
    this.updateDeleteButtonState();
  }

  hasSelectedClaims(): boolean {
    return this.executiveClaims.some(claim => claim.selected);
  }

  updateDeleteButtonState(): void {
    this.showDeleteButton = this.hasSelectedClaims();
  }

  async deleteSelectedClaims(): Promise<void> {
    const selectedClaims = this.executiveClaims.filter(claim => claim.selected);

    if (selectedClaims.length === 0) {
      this.alert.showToastInfo('No hay reclamos seleccionados para eliminar.', 'Información');
      return;
    }

    const confirmed = await this.alert.confirm('¿Estás seguro?', 'Esta acción eliminará los reclamos seleccionados de forma permanente.');
    if (!confirmed) {
      return;
    }

    this.isLoading = true;
    const deletePromises: Promise<void>[] = [];

    for (const claim of selectedClaims) {
      if (claim.uidEjecutivo && claim.id) {
        deletePromises.push(
          this.claimsService.deleteClaim(claim.uidEjecutivo, claim.id)
            .catch(error => {
              console.error(`❌ Error al eliminar el reclamo ${claim.id}:`, error);
              this.alert.error(`No se pudo eliminar el reclamo: ${claim.nombre}`);
            })
        );
      } else {
        console.warn(`⚠️ No se pudo eliminar el reclamo (falta UID o ID):`, claim);
      }
    }

    Promise.all(deletePromises)
  .then(() => {
    this.alert.success('✅ Reclamos seleccionados eliminados con éxito.');
    if (this.currentUserUid) {
      this.loadExecutiveClaims(this.currentUserUid); // ✅ recarga con el UID logueado
    }
  })
  .catch(error => {
    console.error('Un error inesperado ocurrió durante la eliminación masiva:', error);
  })
  .finally(() => {
    this.isLoading = false;
    this.masterChecked = false;
    this.updateDeleteButtonState();
  });
	}

  // Métodos para Paginación

  // Calcula los reclamos a mostrar en la página actual
  updatePagedClaims(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    // Ahora paginamos sobre los reclamos filtrados
    this.pagedClaims = this.filteredClaims.slice(startIndex, endIndex);
  }

  // Calcula el número total de páginas basado en los reclamos filtrados
  getTotalPages(): number {
    return Math.ceil(this.filteredClaims.length / this.itemsPerPage);
  }

  // Retorna un array con los números de página para iterar en el HTML
  getPagesArray(): number[] {
    // Genera un array [1, 2, ..., totalPages]
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // Maneja el cambio de página (al hacer clic en números o anterior/siguiente)
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagedClaims(); // Actualiza los reclamos visibles
    }
  }

  // Maneja el cambio de ítems por página (desde el selector)
  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(target.value);
    this.currentPage = 1; // Siempre vuelve a la primera página al cambiar ítems por página
    this.updatePagedClaims(); // Actualiza los reclamos visibles
  }

  // Se ejecuta cuando el componente se destruye para limpiar suscripciones
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}