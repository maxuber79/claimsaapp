export interface UserModel {
	uid:         string;
	bio?:         string;
	name?:        string;
	last_name?:   string;
	email:       string;
	user_name?:   string;
	surnames?:    string;
	mobile?:      string;
	phone?:       string;
	address?:     string;
	city?:        string;
	commune?:     string;
	profession?:  string;
	photoURL?:    string;
	website?:     string;
	github?:      string;
	instagram?:   string;
	twitter?:     string;
	facebook?:    string;
	created_at?:  CreatedAt;
	createdDate?: Date;
	/**
   * Rol del usuario.
   * Puede ser un string único o un array si deseas manejar múltiples roles.
   * Ejemplo: 'Ejecutivo' | 'Administrador' | 'Director'
   */
  rol?: 'Ejecutivo' | 'Administrador' | 'Director' | string; // o string[] si decides múltiples roles

	/** Si el usuario está activo (true) o deshabilitado (false) */
  activo?: boolean;
}

export interface CreatedAt {
	seconds:     number;
	nanoseconds: number;
}