import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../services/mock-data.service';
import { FormsModule } from '@angular/forms';
import { Claim } from '../../../models/claims';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-reclamos-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reclamos-table.component.html',
  styleUrl: './reclamos-table.component.scss'
})
export class ReclamosTableComponent {
  reclamos: Claim[] = [];
  masterChecked = false;
  loading = true;

  currentPage = 1;
  itemsPerPage = 6;

  selectedClaim: Claim | null = null;
  showModal = false;

  newClaim: Claim = this.getEmptyClaim();
  showNewModal = false;

  constructor(private mockData: MockDataService, private alert: AlertService) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('claims');
    if (saved) {
      this.reclamos = JSON.parse(saved);
      console.table(this.reclamos);
      this.loading = false;
    } else {
      this.mockData.getReclamos().subscribe((data) => {
        this.reclamos = data.map(r => ({ ...r, selected: false }));
        this.saveToLocal();
        this.loading = false;
      });
    }
  }

  get paginatedReclamos(): Claim[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.reclamos.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.reclamos.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.masterChecked = false;
    }
  }

  toggleAll() {
    this.paginatedReclamos.forEach(item => item.selected = this.masterChecked);
  }

  checkMasterState() {
    this.masterChecked = this.paginatedReclamos.every(item => item.selected);
  }

  hasSelected(): boolean {
    return this.reclamos.some(item => item.selected);
  }

  selectedCount(): number {
    return this.reclamos.filter(item => item.selected).length;
  }

  deleteSelected() {
    this.reclamos = this.reclamos.filter(item => !item.selected);
    this.masterChecked = false;
    this.saveToLocal();
  }

  deleteItem(item: Claim) {
    this.reclamos = this.reclamos.filter(r => r.id !== item.id);
    this.saveToLocal();
  }

  editItem(item: Claim) {
    this.selectedClaim = { ...item };
    this.showModal = true;
  }

  saveChanges() {
    if (!this.selectedClaim?.nombre || !this.selectedClaim?.tipo || !this.selectedClaim?.estado) {
      this.alert.warning('Completa los campos obligatorios para editar el reclamo.');
      return;
    }

    const index = this.reclamos.findIndex(r => r.id === this.selectedClaim!.id);
    if (index !== -1) {
      this.reclamos[index] = { ...this.selectedClaim, selected: false };
      this.saveToLocal();
      this.alert.success('El reclamo fue editado correctamente.');
    }
    this.cancelEdit();
  }

  cancelEdit() {
    this.selectedClaim = null;
    this.showModal = false;
  }

  openNewModal() {
    this.newClaim = this.getEmptyClaim();
    this.showNewModal = true;
  }

  saveNewClaim() {
    if (!this.newClaim.nombre || !this.newClaim.tipo || !this.newClaim.estado) {
      this.alert.warning('Completa los campos obligatorios para crear un nuevo reclamo.');
      return;
    }

    const nuevo = {
      ...this.newClaim,
      id: this.mockData.generateUUID(),
      selected: false
    };
    this.reclamos.unshift(nuevo);
    this.saveToLocal();
    this.alert.success('Nuevo reclamo agregado con éxito.');
    this.showNewModal = false;
  }

  cancelNewClaim() {
    this.newClaim = this.getEmptyClaim();
    this.showNewModal = false;
  }

  resetData() {
    localStorage.removeItem('claims');
    this.ngOnInit();
    this.alert.info('Datos restaurados a valores por defecto');
  }

  private saveToLocal() {
    localStorage.setItem('claims', JSON.stringify(this.reclamos));
  }

  private getEmptyClaim(): Claim {
    return {
      id: '',
      nombre: '',
      tipo: '',
      foto: 'https://randomuser.me/api/portraits/lego/1.jpg',
      total: 0,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      selected: false
    };
  }
}
