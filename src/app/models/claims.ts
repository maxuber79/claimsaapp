export interface Claim {
  id: string;
  nombre: string;
  tipo: string;
  total: number;
  fecha: string;
  estado: 'Pendiente' | 'Cancelado' | 'Cerrado' | string;
  foto?: string;
  selected?: boolean; 
	 name?: string; 
	 subject?: string;
	 status?: string;
	 date?: string;
}

export interface ClaimResponse {
	claims: Claim[];
	total: number;
	page: number;
	itemsPerPage: number;
}