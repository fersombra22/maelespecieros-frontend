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

  detalles: DetalleVenta[];
}
