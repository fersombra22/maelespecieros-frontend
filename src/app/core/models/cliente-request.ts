export interface ClienteRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo?: boolean;
}
