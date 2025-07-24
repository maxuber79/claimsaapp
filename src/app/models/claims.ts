export interface Claim {
	id: string;
	nombre: string;
	tipo: string;
	total: number;
	fecha: string;
	estado: 'Iniciado' | 'Pendiente' | 'Cancelado' | 'Cerrado' | string;
	foto?: string;
	selected?: boolean; 
	name?: string; 
	subject?: string;
	status?: string;
	date?: string;
	detail?: string;

	/** UID del ejecutivo asignado */
	uidEjecutivo?: string;
	fromJson?: boolean; // 🔥 Nueva propiedad para indicar si viene del JSON
}

export interface ClaimResponse {
	claims: Claim[];
	total: number;
	page: number;
	itemsPerPage: number;
}