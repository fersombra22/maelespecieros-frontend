export enum EstadoCaja {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA'
}

export interface Caja {
  id: number;
  montoInicial: number;
  montoFinal?: number;
  montoVentas: number;
  diferencia?: number;
  fechaApertura: string;
  fechaCierre?: string;
  estado: EstadoCaja;
  observaciones?: string;
  usuarioId?: number;
  usuarioUsername?: string;
  usuarioNombreCompleto?: string;
  totalEfectivo?: number;
  totalDebito?: number;
  totalCredito?: number;
  totalTransferencia?: number;
  totalDigital?: number;
  cantidadVentas?: number;
  totalEgresos?: number;
  totalEgresosEfectivo?: number;
}

export interface AperturaCajaRequest {
  montoInicial: number;
  observaciones?: string;
}

export interface CierreCajaRequest {
  montoFinal?: number;
  montoEfectivo?: number;
  observaciones?: string;
}

export interface EstadoActualCaja {
  abierta: boolean;
  caja?: Caja;
  montoVentasActual: number;
  montoEsperadoActual: number;
  totalEfectivoActual?: number;
  totalDebitoActual?: number;
  totalCreditoActual?: number;
  totalTransferenciaActual?: number;
  totalDigitalActual?: number;
  cantidadVentasActual?: number;
  totalEgresosActual?: number;
  totalEgresosEfectivoActual?: number;
}
