export enum EstadoCaja {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA'
}

export enum TipoMedioEgreso {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA'
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
  totalEgresosEfectivo?: number;
  totalEgresosTransferencia?: number;
  totalEgresos?: number;
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

export interface EgresoCajaRequest {
  monto: number;
  tipoMedio: TipoMedioEgreso;
  motivo: string;
  comprobante?: string;
}

export interface EgresoCajaResponse {
  id: number;
  cajaId: number;
  monto: number;
  tipoMedio: TipoMedioEgreso;
  motivo: string;
  comprobante?: string;
  fecha: string;
  usuarioId: number;
  usuarioNombre: string;
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
  totalEgresosEfectivoActual?: number;
  totalEgresosTransferenciaActual?: number;
  totalEgresosActual?: number;
}
