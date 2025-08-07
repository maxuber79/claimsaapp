import { Component, OnInit, OnDestroy } from '@angular/core';
import { Claim } from '../../../models/claims';
import { ClaimsService } from '../../../services/claims.service';
import { UserService } from '../../../services/user.service';
import { AlertService } from '../../../services/alert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserModel } from '../../../models/user';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CardMetricComponent } from '../../dashboard/components/card-metric.component';
import { NotificationService } from '../../../services/notification.service';
import { UserNotification } from '../../../models/UserNotification.model';






@Component({
  selector: 'app-admin-claims',
  standalone: true,
  imports: [CommonModule, FormsModule, CardMetricComponent],
  templateUrl: './admin-claims.component.html',
  styleUrls: ['./admin-claims.component.scss']
})
export class AdminClaimsComponent implements OnInit, OnDestroy {


	userUid: string | null = null; // UID del usuario autenticado
	userData: UserModel | null = null; 

  allClaims: Claim[] = [];
  filteredClaims: Claim[] = [];
  pagedClaims: Claim[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private subscriptions: Subscription = new Subscription();

  executives: UserModel[] = [];
  selectedExecutiveUid: string = '';

  searchTerm: string = '';
  filterStatus: string = 'Todos';

  currentPage = 1;
  itemsPerPage = 10;

  masterChecked = false;
  showDeleteButton: boolean = false;

  showNewModal: boolean = false;
  newClaim: Claim = this.getEmptyClaim();


	// ✅ Modal
	selectedClaim: Claim | null = null; // 🔥 Nuevo: el reclamo seleccionado para ver/editar
  isViewOnly: boolean = false; // 🔥 Nuevo: controla si los campos están solo para lectura
	showModal: boolean = false; // 🔥 Nuevo: para controlar la visibilidad del modal de Ver/Editar 
  isEditing: boolean = false; // 🔥 Nuevo: Controla si el modo de edición está activo dentro del modal
	imageDefault = 'https://randomuser.me/api/portraits/men/40.jpg'; // Imagen por defecto	

	metrics: any[] = [];
	claims: any[] = [];

  constructor(
    private claimsService: ClaimsService,
    private userService: UserService,
    private alert: AlertService,
		private authService: AuthService,
		private notificationService: NotificationService
  ) { }

  ngOnInit(): void {



		this.authService.getCurrentUser().subscribe( userData => {
			if (userData) {
				this.userUid = userData.uid;
				console.log('📦 Usuario autenticado:', this.userUid);

				this.userService.getUserProfile(this.userUid).subscribe({
					next: (profile) => {
						this.userData = profile || null;
						console.log('%c<<< infoData | dashboard >>>', 'background: #198754; color: #fff; padding: 2px 5px;', this.userData);
					},
					error: (err:Error) => {
						console.error('❌ Error al cargar perfil de usuario:', err);
					}
				});


			}
		});

		// ⚠️ Solo como prueba (ejecuta esto UNA vez para testear)
	 /* 	this.notificationService.sendToUser(
			'KVDf8PfHEWMdic0SQPcxFMizoBf2',
			'🚀 Notificación de prueba desde Angular'
		);  */

    this.loadExecutives();
    this.loadAllClaims();
  }

	/**
 * Enviar notificación de prueba al UID seleccionado en el reclamo
 */
	sendTestNotification(uidEjecutivo: string): void {
		console.log('🔔 Enviando notificación al ejecutivo UID:', uidEjecutivo);

		if (!uidEjecutivo) {
			console.warn('⚠️ UID del ejecutivo no está definido. No se puede enviar notificación.');
			return;
		}

		const mensaje = `Se te asignó el reclamo: ${this.newClaim?.nombre || 'sin nombre'}`;

		this.notificationService.sendToUser(uidEjecutivo, mensaje, 'asignado')// 👈 Tipo aquí
			.then(() => console.log(`✅ Notificación enviada al ejecutivo: ${uidEjecutivo}`))
			.catch(err => console.error('❌ Error al enviar notificación:', err));
	}

/* sendTestNotification(): void {
  const uidEjecutivo = this.selectedClaim?.uidEjecutivo;

	// 🪵 Log de verificación
  console.log('🔔 Enviando notificación al ejecutivo UID:', uidEjecutivo);

	
  if (!uidEjecutivo) {
    console.warn('⚠️ No hay ejecutivo seleccionado. No se puede enviar notificación.');
    return;
  }

  const mensaje = `🛎️ Se te asignó el reclamo: ${this.selectedClaim?.nombre || 'sin nombre'}`;

  this.notificationService.sendToUser(uidEjecutivo, mensaje)
    .then(() => console.log('✅ Notificación enviada con éxito'))
    .catch(err => console.error('❌ Error al enviar notificación:', err));
} */


  loadExecutives(): void {
    const sub = this.userService.getExecutives().subscribe({
      next: (executives: UserModel[]) => {
        this.executives = executives;
        console.log('✅ Ejecutivos cargados:', this.executives);
      },
      error: (err: any) => {
        console.error('❌ Error al cargar ejecutivos:', err);
        this.alert.error('No se pudieron cargar los ejecutivos.');
      }
    });
    this.subscriptions.add(sub);
  }

  loadAllClaims(): void {
    this.isLoading = true;
    this.errorMessage = null;
    const sub = this.claimsService.getAllClaims().subscribe({
      next: (claims: Claim[]) => {
        this.allClaims = claims.map(c => ({ ...c, selected: false }));
        console.log('✅ Todos los reclamos cargados:', this.allClaims);
        this.isLoading = false;
        this.applyFilters();
				this.claims = [...this.allClaims]; // 👈 Asignamos para que updateMetrics tenga data
				this.updateMetrics();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar todos los reclamos:', err);
        this.errorMessage = 'No se pudieron cargar los reclamos. Inténtalo de nuevo más tarde.';
        this.isLoading = false;
      }
    });
    this.subscriptions.add(sub);
  }

  applyFilters(): void {
    let tempClaims = [...this.allClaims];

    if (this.searchTerm) {
      tempClaims = tempClaims.filter(claim =>
        claim.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.filterStatus && this.filterStatus !== 'Todos') {
      tempClaims = tempClaims.filter(claim =>
        claim.estado === this.filterStatus
      );
    }

    if (this.selectedExecutiveUid) {
      tempClaims = tempClaims.filter(claim =>
        claim.uidEjecutivo === this.selectedExecutiveUid
      );
    }

    this.filteredClaims = tempClaims;
    this.currentPage = 1;
    this.updatePagedClaims();
    this.updateDeleteButtonState();
    this.masterChecked = this.filteredClaims.every(claim => claim.selected);
  }

  updatePagedClaims(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedClaims = this.filteredClaims.slice(startIndex, endIndex);
  }

  openNewModal(): void {
  this.resetNewClaim();
  this.showNewModal = true;
  console.log('💡 showNewModal es:', this.showNewModal); // Añade esta línea
}

  closeNewModal(): void {
    this.showNewModal = false;
  }
	
	saveNewClaim(): void {
  if (!this.newClaim.nombre || !this.newClaim.estado || !this.selectedExecutiveUid) {
    this.alert.showToastError(
      'Por favor, completa todos los campos requeridos (nombre, estado, ejecutivo).',
      'Campos Requeridos'
    );
    return;
  }

  // Asignar ejecutivo al nuevo reclamo
  this.newClaim.uidEjecutivo = this.selectedExecutiveUid;
  this.newClaim.id = this.generateUUID();

  // Logs de depuración
  console.log('🆕 Reclamo preparado para guardar:', this.newClaim);
  console.log('🎯 UID del ejecutivo seleccionado:', this.selectedExecutiveUid);

  this.isLoading = true;

  this.claimsService.createClaim(this.newClaim.uidEjecutivo, this.newClaim)
    .then(() => {
      this.alert.success('Nuevo reclamo asignado con éxito.');
      this.closeNewModal();
      this.loadAllClaims();

      // ✅ Enviar notificación al ejecutivo
      this.notificationService.sendToUser(
        this.selectedExecutiveUid,
        `Se te asignó un nuevo reclamo: ${this.newClaim.nombre}`,
        'asignado'
      )
      .then(() => console.log('✅ Notificación enviada al ejecutivo'))
      .catch(err => console.error('❌ Error al enviar notificación:', err));

    })
    .catch((err: any) => {
      console.error('❌ Error al crear reclamo:', err);
      this.alert.error('Ocurrió un error al crear el reclamo.');
    })
    .finally(() => {
      this.isLoading = false;
    });
}


  resetNewClaim(): void {
    this.newClaim = this.getEmptyClaim();
    this.selectedExecutiveUid = '';
  }

  getEmptyClaim(): Claim {
    return {
      id: '',
      nombre: '',
      tipo: '',
      total: 0,
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0],
      uidEjecutivo: '',
      selected: false
    };
  }

  generateUUID(): string {
    return crypto.randomUUID();
  }

  resetData(): void {
    this.searchTerm = '';
    this.filterStatus = 'Todos';
    this.selectedExecutiveUid = '';
    this.currentPage = 1;
    this.loadAllClaims();
    this.alert.showToastInfo('Filtros restablecidos y datos recargados.', 'Información');
  }

  toggleMasterCheckbox(): void {
    this.masterChecked = !this.masterChecked;
    this.filteredClaims.forEach(claim => claim.selected = this.masterChecked);
    this.updateDeleteButtonState();
  }

  toggleClaimSelection(claim: Claim): void {
    claim.selected = !claim.selected;
    this.masterChecked = this.filteredClaims.every(c => c.selected);
    this.updateDeleteButtonState();
  }

  hasSelectedClaims(): boolean {
    return this.filteredClaims.some(claim => claim.selected);
  }

  updateDeleteButtonState(): void {
    this.showDeleteButton = this.hasSelectedClaims();
  }

  async deleteSelectedClaims(): Promise<void> {
    const selectedClaims = this.filteredClaims.filter(claim => claim.selected);

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
        this.loadAllClaims();
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

  getExecutiveName(uidEjecutivo: string | undefined): string {
    if (!uidEjecutivo) {
      return 'N/A';
    }
    const executive = this.executives.find(exec => exec.uid === uidEjecutivo);
    return executive ? `${executive.name || ''} ${executive.last_name || ''}`.trim() : 'N/A';
  }

  // 🔥 Función para ver un reclamo (abre en modo solo lectura)
  viewClaim(claim: Claim): void {
		console.log('👁️ Ver reclamo:', claim);
    this.selectedClaim = { ...claim }; // Clona el objeto para evitar mutación directa
    this.isViewOnly = true; // Abre en modo solo lectura
    this.showModal = true; // Abre el modal de Ver/Editar
    this.alert.showToastInfo(`Viendo reclamo: ${claim.nombre}`, 'Ver Reclamo');
  }

  // 🔥 Función para editar un reclamo (abre en modo editable, o se puede llamar desde viewClaim)
  editClaim(claim: Claim): void {
    console.log('✏️ Editar reclamo button editClaim:', claim);
		this.selectedClaim = { ...claim }; // Clona el objeto
    this.isViewOnly = false; // Abre en modo editable
    this.showModal = true; // Abre el modal de Ver/Editar
    this.alert.showToastInfo(`Editando reclamo: ${claim.nombre}`, 'Editar Reclamo'); 
  }

	openViewEditModal(claim: Claim, viewMode: boolean = true): void {
    console.log(`Abriendo modal para ver/editar reclamo:`, claim);
    this.selectedClaim = { ...claim }; // Clona el objeto para evitar mutación directa
    this.isViewOnly = true; // Siempre inicia en modo de visualización
    this.isEditing = false; // 🔥 Asegúrate de que no esté en modo edición al abrir
    this.showModal = true;
    this.alert.showToastInfo(`Viendo reclamo: ${claim.nombre}`, 'Ver Reclamo');
  }

	// 🔥 Habilita el modo de edición dentro del modal
  enableEdit(): void {
    this.isViewOnly = false; // Desactiva el modo solo lectura
    this.isEditing = true; // 🔥 Activa el modo de edición
    this.alert.showToastInfo('Modo de edición activado.', 'Editar Reclamo');
  }

	// 🔥 Alterna el modo de solo lectura dentro del modal
  // Alterna el modo de solo lectura dentro del modal
  toggleEditMode(): void {
    this.isViewOnly = !this.isViewOnly;
    this.alert.showToastInfo(
      this.isViewOnly ? 'Modo de visualización activado.' : 'Modo de edición activado.',
      'Cambio de Modo'
    );
  }

	saveChanges(): void {
		console.log('💾 Guardando cambios para el reclamo:', this.selectedClaim);


     if (this.selectedClaim && this.selectedClaim.uidEjecutivo && this.selectedClaim.id) {


      this.claimsService.updateClaim(this.selectedClaim.uidEjecutivo, this.selectedClaim)
        .then(() => {
          this.alert.showToastSuccess('✅ Reclamo actualizado con éxito.', 'OK!');
          this.loadAllClaims(); // Recarga los datos para reflejar el cambio
          this.cancelEdit(); // Cierra el modal


					if (this.selectedClaim && this.selectedClaim.uidEjecutivo) {
						const uidEjecutivo: string = this.selectedClaim.uidEjecutivo;

						this.notificationService.sendToUser(
							uidEjecutivo,                                           // ✅ string garantizado
							`Se ha actualizado el reclamo #${this.selectedClaim.id}`, // Mensaje
							'editado'                                                // Tipo
						)
						.then(() => console.log('✅ Notificación de edición enviada al ejecutivo'))
						.catch(err => console.error('❌ Error al enviar notificación de edición:', err));
					} else {
						console.warn('⚠️ Reclamo sin ejecutivo asignado. No se envía notificación.');
					}





        })
        .catch(err => {
          console.error('❌ Error al actualizar el reclamo:', err);
          this.alert.showToastError('Ocurrió un error al actualizar el reclamo.', 'Error');
        });
    } else {
      this.alert.showToastError('No hay reclamo seleccionado o faltan datos para actualizar.', 'Error');
    }  
  }

	// 🔥 Cierra el modal de Ver/Editar y limpia el reclamo seleccionado
	cancelEdit(): void {
    this.selectedClaim = null;
    this.showModal = false;
    this.isEditing = false; // 🔥 Reinicia el estado de edición al cerrar
    this.isViewOnly = false; // Reinicia también el modo de visualización
  }

	// 🔥 Guarda los cambios del reclamo editado
  saveEditedClaim(): void {
    if (this.selectedClaim && this.selectedClaim.uidEjecutivo && this.selectedClaim.id) {
      this.claimsService.updateClaim(this.selectedClaim.uidEjecutivo, this.selectedClaim)
        .then(() => {
          this.alert.success('✅ Reclamo actualizado con éxito.');
          this.loadAllClaims(); // Recarga los datos para reflejar el cambio
          this.cancelEdit(); // Cierra el modal
        })
        .catch(err => {
          console.error('❌ Error al actualizar el reclamo:', err);
          this.alert.error('Ocurrió un error al actualizar el reclamo.');
        });
    } else {
      this.alert.showToastError('No hay reclamo seleccionado o faltan datos para actualizar.', 'Error');
    }
  }

	cancelNewClaim(): void {
		this.newClaim = this.getEmptyClaim(); // Limpia
		this.showNewModal = false;
	}

  getTotalPages(): number {
    return Math.ceil(this.filteredClaims.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePagedClaims();
    }
  }

  onItemsPerPageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(target.value);
    this.currentPage = 1;
    this.updatePagedClaims();
  }

	// 🔥 Función para eliminar un solo reclamo (llamada desde el botón en cada fila) 🔥
  deleteClaim(claimId: string): void {
    const claimToDelete = this.allClaims.find(claim => claim.id === claimId);

    if (claimToDelete && claimToDelete.uidEjecutivo) {
      if (confirm('¿Estás seguro de que quieres eliminar este reclamo?')) {
        this.claimsService.deleteClaim(claimToDelete.uidEjecutivo, claimId)
          .then(() => {
            this.alert.success('✅ Reclamo eliminado con éxito.');
            this.loadAllClaims();
          })
          .catch(err => {
            console.error('❌ Error al eliminar el reclamo:', err);
            this.alert.error('Ocurrió un error al eliminar el reclamo.');
          });
      }
    } else {
      this.alert.showToastError('No se pudo encontrar el reclamo para eliminar o falta el UID del ejecutivo.', 'Error');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

	private updateMetrics(): void {
  const total = this.claims.length;
  const iniciados = this.claims.filter(c => c.estado === 'Iniciado').length;
  const pendientes = this.claims.filter(c => c.estado === 'Pendiente').length;
  const cancelados = this.claims.filter(c => c.estado === 'Cancelado').length;
  const cerrados = this.claims.filter(c => c.estado === 'Cerrado').length;

  // 🔍 DEBUG
  console.log('📊 Métricas actualizadas:');
  console.log('➡️ Total:', total);
  console.log('🟦 Iniciados:', iniciados);
  console.log('🟨 Pendientes:', pendientes);
  console.log('🟥 Cancelados:', cancelados);
  console.log('🟩 Cerrados:', cerrados);

  this.metrics = [
    {
      icon: 'bi-folder-check',
      count: total,
      label: 'Total de Reclamos',
      color: 'primary',
      footerText: 'Todos los reclamos registrados',
      trendIcon: 'bi-bar-chart'
    },
    {
      icon: 'bi-play-circle',
      count: iniciados,
      label: 'Iniciados',
      color: 'info',
      footerText: 'Reclamos en inicio',
      trendIcon: 'bi-graph-up'
    },
    {
      icon: 'bi-hourglass-split',
      count: pendientes,
      label: 'Pendientes',
      color: 'warning',
      footerText: 'Requieren atención',
      trendIcon: 'bi-exclamation-circle'
    },
    {
      icon: 'bi-x-circle',
      count: cancelados,
      label: 'Cancelados',
      color: 'danger',
      footerText: 'No continuaron',
      trendIcon: 'bi-x-circle'
    },
    {
      icon: 'bi-check-circle',
      count: cerrados,
      label: 'Cerrados',
      color: 'success',
      footerText: 'Reclamos resueltos',
      trendIcon: 'bi-check-circle'
    }
  ];
}

}