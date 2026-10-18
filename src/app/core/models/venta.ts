import { DetalleVenta } from './detalle-venta';

export interface Venta {
  id: number;
  numeroVenta: string;
  fecha: string;
  subtotal: number;
  descuento: number;
  total: number;
  formaPago: string;
  estado: string;
  usuarioId?: number;
  usuario?: string;
  clienteId?: number | null;
  clienteNombreCompleto?: string;
  detalles: DetalleVenta[];
}
