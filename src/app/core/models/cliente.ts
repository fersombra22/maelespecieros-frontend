export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
  fechaAlta?: string;
  fechaActualizacion?: string;
}
