import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../../core/models/cliente';
import { ClienteRequest } from '../../../core/models/cliente-request';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.css'],
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() clienteEditar?: Cliente;
  @Output() guardar = new EventEmitter<ClienteRequest>();
  @Output() cancelar = new EventEmitter<void>();

  formulario!: FormGroup;

  ngOnInit(): void {
    this.crearFormulario();
    if (this.clienteEditar) {
      this.cargarDatos();
    }
  }

  crearFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],
      apellido: ['', [Validators.required, Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(120)]],
      telefono: ['', [Validators.maxLength(30)]],
      direccion: ['', [Validators.maxLength(200)]],
      activo: [true],
    });
  }

  cargarDatos(): void {
    if (!this.clienteEditar) return;
    this.formulario.patchValue({
      nombre: this.clienteEditar.nombre,
      apellido: this.clienteEditar.apellido,
      email: this.clienteEditar.email,
      telefono: this.clienteEditar.telefono || '',
      direccion: this.clienteEditar.direccion || '',
      activo: this.clienteEditar.activo,
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const val = this.formulario.value;
    const request: ClienteRequest = {
      nombre: val.nombre.trim(),
      apellido: val.apellido.trim(),
      email: val.email.trim().toLowerCase(),
      telefono: val.telefono ? val.telefono.trim() : '',
      direccion: val.direccion ? val.direccion.trim() : '',
      activo: val.activo ?? true,
    };

    this.guardar.emit(request);
  }

  cerrar(): void {
    this.cancelar.emit();
  }
}
