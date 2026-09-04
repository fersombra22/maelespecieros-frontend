import { DetalleVentaRequest } from './detalle-venta-request';

export interface VentaRequest {
  formaPago: string;

  descuento: number;

  detalles: DetalleVentaRequest[];
}
