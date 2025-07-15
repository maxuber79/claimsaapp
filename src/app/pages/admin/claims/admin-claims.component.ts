import { Component, OnInit } from '@angular/core';
import { Claim } from '../../../models/claims'; // ajusta si está en otra ruta
import { ClaimsService } from '../../../services/claims.service';
import { ClaimsDummyService } from '../../../services/claims-dummy.service';
import { UserService } from '../../../services/user.service';
import { AlertService } from '../../../services/alert.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserModel } from '../../../models/user';
import { MockDataService } from '../../../services/mock-data.service';


@Component({
  selector: 'app-admin-claims',
	standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-claims.component.html',
  styleUrls: ['./admin-claims.component.scss']
})
export class AdminClaimsComponent implements OnInit {

  reclamos: Claim[] = [];
  uid: string = '';
	isLoading: boolean = true;

	// Lista de ejecutivos (poblar desde Firestore)
	ejecutivos: { uid: string, nombre: string }[] = [];
	 



  // 🔘 Filtros
  selectedStatus: string = '';
  selectedChannel: string = '';

  // ✅ Paginación
  currentPage = 1;
  itemsPerPage = 6;

  // ✅ Checkbox maestro
  masterChecked = false;

  // ✅ Modal
	isViewOnly = true; // 🔒 Modo lectura por defecto
  selectedClaim: Claim | null = null;
  showModal = false;

	// ✅ Reclamo nuevo
	showNewModal: boolean = false;
	newClaim: Claim = this.getEmptyClaim();
	executives: UserModel[] = [];
	selectedExecutiveUid: string = '';

	estadosDisponibles: string[] = ['Pendiente', 'En Proceso', 'Resuelto', 'Cancelado', 'Cerrado'];
	canalesDisponibles: string[] = ['Web', 'App', 'WhatsApp', 'Call Center']; // o 'tipo' según tu modelo
	searchTerm: string = '';
	filterEstado: string = '';
	filterCanal: string = ''; 

  constructor(
    private claimsService: ClaimsService,
    private claimsDummyService: ClaimsDummyService,
    private userService: UserService,
    private alert: AlertService,
		private mockData: MockDataService
  ) {}

  ngOnInit(): void {
    this.userService.getCurrentUserUid().subscribe(uid => {
      if (!uid) return;
      this.uid = uid;

      // Traemos reclamos de dummy y Firebase
      this.loadClaims();
    });

		this.userService.getExecutives().subscribe({
			next: (executives) => {
				this.executives = executives;
				console.log('👥 Ejecutivos:', executives);
			},
			error: (error) => {
				console.error('❌ Error al cargar ejecutivos:', error);
			}
		});
  }

loadClaims() {
	this.isLoading = true;

	this.claimsDummyService.getClaimsByUser(this.uid).subscribe(dummy => {
		this.claimsService.getAllClaims().subscribe(firebase => {
			this.reclamos = [...dummy, ...firebase].map(r => ({ ...r, selected: false }));
			this.applyFilters();
			this.isLoading = false;
		});
	});
}
	

  // 🔄 Filtros + paginación combinados
  get paginatedReclamos(): Claim[] {
		const filtered = this.reclamos.filter(r =>
			(!this.searchTerm || r.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
			(!this.filterEstado || r.estado === this.filterEstado) &&
			(!this.filterCanal || r.tipo === this.filterCanal)
		);
	
		const start = (this.currentPage - 1) * this.itemsPerPage;
		return filtered.slice(start, start + this.itemsPerPage);
	}

	applyFilters(): void {
		// No es necesario hacer nada porque ya estás filtrando con getters reactivos
	}	

  // ✅ Checkboxes
  toggleAll(): void {
    this.paginatedReclamos.forEach(item => item.selected = this.masterChecked);
  }

  checkMasterState(): void {
    this.masterChecked = this.paginatedReclamos.every(item => item.selected);
  }

  hasSelected(): boolean {
    return this.reclamos.some(r => r.selected);
  }

  selectedCount(): number {
    return this.reclamos.filter(r => r.selected).length;
  }

  deleteSelected(): void {
    this.reclamos = this.reclamos.filter(r => !r.selected);
    this.masterChecked = false;
    this.alert.info('Reclamos eliminados correctamente');
  }

  // ✅ Acciones
  deleteItem(item: Claim): void {
    this.reclamos = this.reclamos.filter(r => r.id !== item.id);
    this.alert.success('Reclamo eliminado');
  }

  editItem(item: Claim): void {
    this.selectedClaim = { ...item };
		this.isViewOnly = true; // Se abre como solo lectura
    this.showModal = true;
  }

	enableEditing() {
		this.isViewOnly = false; // 🔓 Activa los campos
	}

  cancelEdit(): void {
    this.selectedClaim = null;
    this.showModal = false;
  }

  saveChanges(): void {
    if (!this.selectedClaim?.nombre || !this.selectedClaim?.tipo || !this.selectedClaim?.estado) {
      this.alert.warning('Completa los campos requeridos');
      return;
    }

    const idx = this.reclamos.findIndex(r => r.id === this.selectedClaim!.id);
    if (idx !== -1) {
      this.reclamos[idx] = { ...this.selectedClaim!, selected: false };
      this.alert.success('Reclamo actualizado');
    }

    this.cancelEdit();
  }

  // Placeholder para asignación a ejecutivo
  assignToExecutive(reclamo: Claim): void {
		console.log('Asignar reclamo:', reclamo);
    this.alert.info('Función para asignar a ejecutivo aún no implementada');
  }

	get totalPages(): number {
		const filtered = this.reclamos.filter(r =>
			(!this.searchTerm || r.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())) &&
			(!this.filterEstado || r.estado === this.filterEstado) &&
			(!this.filterCanal || r.tipo === this.filterCanal)
		);
		return Math.ceil(filtered.length / this.itemsPerPage);
	}	

	changePage(page: number): void {
		if (page >= 1 && page <= this.totalPages) {
			this.currentPage = page;
		}
	}	

	openNewModal(): void {
		this.newClaim = this.getEmptyClaim(); // Reinicia los datos
		this.selectedExecutiveUid = ''; // Limpia la selección del ejecutivo
		this.showNewModal = true;
		//this.loadEjecutivos();  
	}
	
	cancelNewClaim(): void {
		this.newClaim = this.getEmptyClaim(); // Limpia
		this.showNewModal = false;
	}
	
	saveNewClaim() {
		if (!this.newClaim.nombre || !this.newClaim.tipo || !this.newClaim.estado || !this.selectedExecutiveUid) {
			this.alert.warning('Completa todos los campos, incluyendo el ejecutivo asignado.');
			return;
		}
	
		const nuevo: Claim = {
			...this.newClaim,
			id: this.mockData.generateUUID(), // Puedes dejarlo o usar `doc().id` si quieres auto-ID
			uidEjecutivo: this.selectedExecutiveUid,
			selected: false
		};
	
		/* this.claimsService.createClaim(this.selectedExecutiveUid, nuevo)
			.then(() => {
				this.reclamos.unshift(nuevo); // Opcional: para que se vea al instante en la UI
				this.saveToLocal(); // Si deseas mantenerlo en localStorage
				this.alert.success('✅ Reclamo creado y asignado con éxito.');
				this.showNewModal = false;
				// 🔄 Vuelve a cargar la lista actualizada
				this.loadClaims();
				this.resetNewClaim();
			})
			.catch(err => {
				console.error('❌ Error al guardar reclamo:', err);
				this.alert.error('Ocurrió un error al guardar el reclamo.');
			}); */
			this.claimsService.createClaim(this.selectedExecutiveUid, nuevo)
				.then(() => {
					this.loadClaims();
					this.alert.success('Nuevo reclamo asignado con éxito.');
					this.showNewModal = false;
				})
				.catch((err: any) => {
					console.error('❌ Error al crear reclamo:', err);
					this.alert.error('Ocurrió un error al crear el reclamo.');
				});
			
	}
	
	resetNewClaim() {
		this.newClaim = this.getEmptyClaim();
		this.selectedExecutiveUid = '';
	}
	
	getEmptyClaim(): Claim {
		return {
			id: '',
			nombre: '',
			tipo: '',
			estado: 'Pendiente',
			fecha: new Date().toISOString().split('T')[0],
			foto: '',
			total: 0, 
    	uidEjecutivo: '', // 👈 este campo nuevo
			selected: false
		};
	}

	generateUUID(): string {
		return crypto.randomUUID();
	}

	private saveToLocal(): void {
		localStorage.setItem('claims', JSON.stringify(this.reclamos));
	}

	resetData() {
    localStorage.removeItem('claims');
    //this.ngOnInit();
		this.currentPage = 1;         // Reinicia paginación
  	this.ngOnInit(); 
    this.alert.showToastInfo('Datos restaurados a valores por defecto', 'Información');
  }

	infoRow(info:any) {
		console.log('Información del button:', info);
	}

	/* loadEjecutivos() {
		this.userService.getAllEjecutivos().subscribe(users => {
			this.ejecutivos = users; // [{ uid: 'abc', nombre: 'Juan Pérez' }, ...]
		});
	} */

	getExecutiveName(uid: string): string {
		const exec = this.executives.find(e => e.uid === uid);
		return exec ? `${exec.name} (${exec.email})` : 'No asignado';
	}
	
	
}
