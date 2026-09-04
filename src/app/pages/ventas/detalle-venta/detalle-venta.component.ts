import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Venta } from '../../../core/models/venta';

@Component({
  selector: 'app-detalle-venta',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './detalle-venta.component.html',

  styleUrls: ['./detalle-venta.component.css'],
})
export class DetalleVentaComponent {
  @Input()
  venta?: Venta;

  @Output()
  cerrar = new EventEmitter<void>();

  cerrarModal(): void {
    this.cerrar.emit();
  }
}
