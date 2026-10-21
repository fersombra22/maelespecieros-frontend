import { DetalleVentaRequest } from './detalle-venta-request';

export interface VentaRequest {
  clienteId?: number | null;
  formaPago: string;
  descuento: number;
  detalles: DetalleVentaRequest[];
}
