import { Component, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { CajaService } from '../../core/services/caja.service';
import { Caja, EstadoActualCaja, EstadoCaja } from '../../core/models/caja';

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
  private cdr = inject(ChangeDetectorRef);

  EstadoCaja = EstadoCaja;

  cargando: boolean = true;
  procesando: boolean = false;

  estadoActual?: EstadoActualCaja;
  historial: Caja[] = [];

  // Paginación historial
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;

  // Modales
  mostrarModalApertura: boolean = false;
  mostrarModalCierre: boolean = false;

  // Formularios reactivos
  formApertura: FormGroup;
  formCierre: FormGroup;

  constructor() {
    this.formApertura = this.fb.group({
      montoInicial: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['', [Validators.maxLength(500)]],
    });

    this.formCierre = this.fb.group({
      montoFinal: [0, [Validators.required, Validators.min(0)]],
      observaciones: ['', [Validators.maxLength(500)]],
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

  abrirModalCierre(): void {
    const montoEsperado = this.estadoActual?.montoEsperadoActual ?? 0;
    this.formCierre.reset({ montoFinal: montoEsperado, observaciones: '' });
    this.mostrarModalCierre = true;
    this.cdr.markForCheck();
  }

  cerrarModalCierre(): void {
    this.mostrarModalCierre = false;
    this.cdr.markForCheck();
  }

  get diferenciaCierre(): number {
    const finalVal = Number(this.formCierre.get('montoFinal')?.value || 0);
    const esperadoVal = Number(this.estadoActual?.montoEsperadoActual || 0);
    return finalVal - esperadoVal;
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

    const { montoFinal, observaciones } = this.formCierre.value;
    const dif = this.diferenciaCierre;
    let mensajeDiferencia = '';

    if (dif === 0) {
      mensajeDiferencia = 'El arqueo es exacto (sin diferencias).';
    } else if (dif > 0) {
      mensajeDiferencia = `Sobrante de caja: +$${dif.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    } else {
      mensajeDiferencia = `Faltante de caja: -$${Math.abs(dif).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    }

    Swal.fire({
      title: '¿Confirmar Cierre y Arqueo?',
      html: `
        <p class="mb-2"><strong>Monto ingresado:</strong> $${Number(montoFinal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
        <p class="mb-2"><strong>Monto esperado:</strong> $${(this.estadoActual?.montoEsperadoActual || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
        <p class="${dif < 0 ? 'text-danger fw-bold' : dif > 0 ? 'text-warning fw-bold' : 'text-success fw-bold'}">${mensajeDiferencia}</p>
      `,
      icon: dif !== 0 ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar caja',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: dif !== 0 ? '#dc3545' : '#0d6efd',
    }).then((result) => {
      if (result.isConfirmed) {
        this.procesando = true;
        this.cdr.markForCheck();

        this.cajaService.cerrar({ montoFinal: Number(montoFinal), observaciones }).subscribe({
          next: () => {
            this.procesando = false;
            this.mostrarModalCierre = false;
            Swal.fire({
              icon: 'success',
              title: 'Caja Cerrada',
              text: 'El arqueo y cierre de caja se completó exitosamente.',
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

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPages) {
      this.currentPage = nuevaPagina;
      this.cargarHistorial();
    }
  }
}
