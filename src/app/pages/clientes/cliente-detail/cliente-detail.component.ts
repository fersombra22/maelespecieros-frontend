import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../core/models/cliente';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cliente-detail.component.html',
  styleUrls: ['./cliente-detail.component.css'],
})
export class ClienteDetailComponent {
  @Input() cliente?: Cliente;
  @Output() cerrar = new EventEmitter<void>();
  @Output() editar = new EventEmitter<Cliente>();
  @Output() toggleEstado = new EventEmitter<Cliente>();

  onCerrar(): void {
    this.cerrar.emit();
  }

  onEditar(): void {
    if (this.cliente) {
      this.editar.emit(this.cliente);
    }
  }

  onToggleEstado(): void {
    if (this.cliente) {
      this.toggleEstado.emit(this.cliente);
    }
  }

  getIniciales(): string {
    if (!this.cliente) return 'CL';
    const n = this.cliente.nombre ? this.cliente.nombre.charAt(0) : '';
    const a = this.cliente.apellido ? this.cliente.apellido.charAt(0) : '';
    return (n + a).toUpperCase() || 'CL';
  }
}
