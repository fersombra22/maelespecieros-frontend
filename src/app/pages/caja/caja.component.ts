import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { CajaService } from '../../core/services/caja.service';
import { GastoOperativoService } from '../../core/services/gasto-operativo.service';
import { AuthService } from '../../core/services/auth.service';
import { Rol } from '../../core/models/rol';
import { Caja, EstadoActualCaja, EstadoCaja } from '../../core/models/caja';
import { CategoriaGasto, CategoriaGastoLabels, GastoOperativo } from '../../core/models/gasto-operativo';

@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CajaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cajaService = inject(CajaService);
  private gastoService = inject(GastoOperativoService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  get puedeVerHistorial(): boolean {
    const rol = this.authService.obtenerUsuario()?.rol;
    return rol === Rol.ADMIN || rol === Rol.SUPER_ADMIN;
  }

  EstadoCaja = EstadoCaja;
  CategoriaGasto = CategoriaGasto;
  CategoriaGastoLabels = CategoriaGastoLabels;
  categoriasGastoList = Object.values(CategoriaGasto);

  cargando: boolean = true;
  procesando: boolean = false;
  cargandoEgresos: boolean = false;

  estadoActual?: EstadoActualCaja;
  historial: Caja[] = [];
  egresosTurno: GastoOperativo[] = [];

  // Paginación historial
  currentPage: number = 0;
  pageSize: number = 3;
  totalElements: number = 0;
  totalPages: number = 0;

  // Modales
  mostrarModalApertura: boolean = false;
  mostrarModalCierre: boolean = false;
  mostrarModalComprobante: boolean = false;
  mostrarModalGasto: boolean = false;
  comprobanteSeleccionado: Caja | null = null;

  // Formularios reactivos
  formApertura: FormGroup;
  formCierre: FormGroup;
  formGasto: FormGroup;

  constructor() {
    this.formApertura = this.fb.group({
      montoInicial: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['', [Validators.maxLength(500)]],
    });

    this.formCierre = this.fb.group({
      montoEfectivo: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['', [Validators.maxLength(500)]],
    });

    this.formGasto = this.fb.group({
      monto: [null, [Validators.required, Validators.min(0.01)]],
      concepto: ['', [Validators.required, Validators.maxLength(250)]],
      categoriaGasto: [CategoriaGasto.VARIOS, [Validators.required]],
      formaPago: ['EFECTIVO', [Validators.required]],
      comprobanteNro: ['', [Validators.maxLength(50)]],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.cdr.markForCheck();

    this.cajaService.obtenerEstadoActual().subscribe({
      next: (res) => {
        this.estadoActual = res.data;
        if (this.estadoActual?.abierta) {
          this.cargarEgresosTurno();
        } else {
          this.egresosTurno = [];
        }
        this.cargarHistorial();
      },
      error: (err) => {
        this.cargando = false;
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: err.error?.message || 'No se pudo obtener el estado de la caja.',
        });
      },
    });
  }

  cargarEgresosTurno(): void {
    this.cargandoEgresos = true;
    this.gastoService.listarPorCajaActual().subscribe({
      next: (res) => {
        this.egresosTurno = res.data || [];
        this.cargandoEgresos = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargandoEgresos = false;
        this.cdr.markForCheck();
      },
    });
  }

  cargarHistorial(): void {
    this.cajaService.listarHistorial(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.historial = res.data?.content || [];
        this.totalElements = res.data?.totalElements || 0;
        this.totalPages = res.data?.totalPages || 0;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.cdr.markForCheck();
      },
    });
  }

  abrirModalApertura(): void {
    this.formApertura.reset({ montoInicial: 0, observaciones: '' });
    this.mostrarModalApertura = true;
    this.cdr.markForCheck();
  }

  cerrarModalApertura(): void {
    this.mostrarModalApertura = false;
    this.cdr.markForCheck();
  }

  get efectivoEsperadoGaveta(): number {
    const fondoInicial = Number(this.estadoActual?.caja?.montoInicial || 0);
    const ventasEfectivo = Number(this.estadoActual?.totalEfectivoActual || 0);
    const egresosEfectivo = Number(this.estadoActual?.totalEgresosEfectivoActual || 0);
    return fondoInicial + ventasEfectivo - egresosEfectivo;
  }

  abrirModalCierre(): void {
    const efectivoEsperado = this.efectivoEsperadoGaveta;
    this.formCierre.reset({ montoEfectivo: efectivoEsperado, observaciones: '' });
    this.mostrarModalCierre = true;
    this.cdr.markForCheck();
  }

  cerrarModalCierre(): void {
    this.mostrarModalCierre = false;
    this.cdr.markForCheck();
  }

  get efectivoContado(): number {
    return Number(this.formCierre.get('montoEfectivo')?.value || 0);
  }

  get diferenciaEfectivo(): number {
    return this.efectivoContado - this.efectivoEsperadoGaveta;
  }

  get totalRendidoCalculado(): number {
    const digital = Number(this.estadoActual?.totalDigitalActual || 0);
    return this.efectivoContado + digital;
  }

  // ==========================================
  // METODOS DE GASTOS OPERATIVOS
  // ==========================================
  abrirModalGasto(): void {
    this.formGasto.reset({
      monto: null,
      concepto: '',
      categoriaGasto: CategoriaGasto.VARIOS,
      formaPago: 'EFECTIVO',
      comprobanteNro: '',
    });
    this.mostrarModalGasto = true;
    this.cdr.markForCheck();
  }

  cerrarModalGasto(): void {
    this.mostrarModalGasto = false;
    this.cdr.markForCheck();
  }

  confirmarGasto(): void {
    if (this.formGasto.invalid) {
      this.formGasto.markAllAsTouched();
      return;
    }

    const { monto, concepto, categoriaGasto, formaPago, comprobanteNro } = this.formGasto.value;
    this.procesando = true;
    this.cdr.markForCheck();

    this.gastoService.registrar({
      monto: Number(monto),
      concepto: concepto?.trim(),
      categoriaGasto,
      formaPago,
      comprobanteNro: comprobanteNro?.trim() || undefined,
    }).subscribe({
      next: () => {
        this.procesando = false;
        this.mostrarModalGasto = false;
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'success',
          title: 'Gasto Registrado',
          text: 'El egreso ha sido registrado exitosamente y auditado en el sistema.',
          timer: 2000,
          showConfirmButton: false,
        });
        this.cargarDatos();
      },
      error: (err) => {
        this.procesando = false;
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar egreso',
          text: err.error?.message || 'No se pudo registrar el gasto operativo.',
        });
      },
    });
  }

  anularGasto(gasto: GastoOperativo): void {
    Swal.fire({
      title: '¿Anular este gasto operativo?',
      html: `¿Estás seguro de anular el gasto de <strong>$${Number(gasto.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong> por concepto <em>"${gasto.concepto}"</em>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular gasto',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (result.isConfirmed) {
        this.gastoService.anular(gasto.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Gasto Anulado',
              text: 'El gasto ha sido anulado y auditado correctamente.',
              timer: 2000,
              showConfirmButton: false,
            });
            this.cargarDatos();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al anular gasto',
              text: err.error?.message || 'No se pudo anular el gasto operativo.',
            });
          },
        });
      }
    });
  }

  confirmarApertura(): void {
    if (this.formApertura.invalid) {
      this.formApertura.markAllAsTouched();
      return;
    }

    const { montoInicial, observaciones } = this.formApertura.value;

    Swal.fire({
      title: '¿Confirmar Apertura de Caja?',
      text: `Se iniciará un nuevo turno con un monto inicial de $${Number(montoInicial).toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, abrir caja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#198754',
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesando = true;
        this.cdr.markForCheck();

        this.cajaService.abrir({ montoInicial: Number(montoInicial), observaciones }).subscribe({
          next: () => {
            this.procesando = false;
            this.mostrarModalApertura = false;
            Swal.fire({
              icon: 'success',
              title: 'Caja Abierta',
              text: 'La caja se abrió correctamente.',
              timer: 2000,
              showConfirmButton: false,
            });
            this.cargarDatos();
          },
          error: (err) => {
            this.procesando = false;
            this.cdr.markForCheck();
            Swal.fire({
              icon: 'error',
              title: 'No se pudo abrir la caja',
              text: err.error?.message || 'Ocurrió un error inesperado.',
            });
          },
        });
      }
    });
  }

  confirmarCierre(): void {
    if (this.formCierre.invalid) {
      this.formCierre.markAllAsTouched();
      return;
    }

    const { montoEfectivo, observaciones } = this.formCierre.value;
    const dif = this.diferenciaEfectivo;
    let mensajeDiferencia = '';

    if (dif === 0) {
      mensajeDiferencia = 'El arqueo de efectivo es exacto (sin diferencias).';
    } else if (dif > 0) {
      mensajeDiferencia = `Sobrante en efectivo: +$${dif.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    } else {
      mensajeDiferencia = `Faltante en efectivo: -$${Math.abs(dif).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    }

    Swal.fire({
      title: '¿Confirmar Cierre y Arqueo?',
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.6;">
          <p class="mb-1"><strong>Fondo Inicial:</strong> $${(this.estadoActual?.caja?.montoInicial || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          <p class="mb-1"><strong>Ventas en Efectivo:</strong> +$${(this.estadoActual?.totalEfectivoActual || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          <p class="mb-1"><strong>Egresos en Efectivo:</strong> -$${(this.estadoActual?.totalEgresosEfectivoActual || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          <hr style="margin: 8px 0; border-color: rgba(255,255,255,0.2);" />
          <p class="mb-1"><strong>Efectivo Esperado en Gaveta:</strong> $${this.efectivoEsperadoGaveta.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          <p class="mb-1"><strong>Efectivo Físico Contado:</strong> $${Number(montoEfectivo).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          <p class="mb-1"><strong>Pagos Digitales (Auto):</strong> $${(this.estadoActual?.totalDigitalActual || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          <hr style="margin: 8px 0; border-color: rgba(255,255,255,0.2);" />
          <p class="mb-2"><strong>Total Rendido Turno:</strong> $${this.totalRendidoCalculado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          <p class="${dif < 0 ? 'text-danger fw-bold' : dif > 0 ? 'text-warning fw-bold' : 'text-success fw-bold'}">${mensajeDiferencia}</p>
        </div>
      `,
      icon: dif !== 0 ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar caja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: dif !== 0 ? '#dc3545' : '#8b5cf6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesando = true;
        this.cdr.markForCheck();

        this.cajaService.cerrar({ montoEfectivo: Number(montoEfectivo), observaciones }).subscribe({
          next: (res) => {
            this.procesando = false;
            this.mostrarModalCierre = false;
            this.cdr.markForCheck();

            Swal.fire({
              icon: 'success',
              title: 'Caja Cerrada Exitosamente',
              html: 'El turno finalizó correctamente. ¿Deseas imprimir el comprobante de cierre de turno ahora?',
              showCancelButton: true,
              confirmButtonText: '<i class="fa-solid fa-print"></i> Ver e Imprimir Comprobante',
              cancelButtonText: 'Cerrar',
              confirmButtonColor: '#8b5cf6',
            }).then((swalResult) => {
              if (swalResult.isConfirmed && res.data) {
                this.verComprobante(res.data);
              }
            });
            this.cargarDatos();
          },
          error: (err) => {
            this.procesando = false;
            this.cdr.markForCheck();
            Swal.fire({
              icon: 'error',
              title: 'Error al cerrar caja',
              text: err.error?.message || 'No se pudo realizar el cierre.',
            });
          },
        });
      }
    });
  }

  verComprobante(caja: Caja): void {
    if (!caja.id) return;
    this.cargando = true;
    this.cdr.markForCheck();

    this.cajaService.obtenerPorId(caja.id).subscribe({
      next: (res) => {
        this.cargando = false;
        this.comprobanteSeleccionado = res.data || caja;
        this.mostrarModalComprobante = true;
        this.cdr.markForCheck();
      },
      error: () => {
        this.cargando = false;
        this.comprobanteSeleccionado = caja;
        this.mostrarModalComprobante = true;
        this.cdr.markForCheck();
      },
    });
  }

  cerrarModalComprobante(): void {
    this.mostrarModalComprobante = false;
    this.comprobanteSeleccionado = null;
    this.cdr.markForCheck();
  }

  imprimirComprobante(): void {
    window.print();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages) {
      this.currentPage = nuevaPagina;
      this.cargarHistorial();
    }
  }
}
