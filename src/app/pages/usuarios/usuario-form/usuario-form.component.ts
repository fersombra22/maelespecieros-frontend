import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Usuario } from '../../../core/models/usuario';

@Component({
  selector: 'app-usuario-form',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './usuario-form.component.html',

  styleUrls: ['./usuario-form.component.css'],
})
export class UsuarioFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input()
  usuarioEditar?: Usuario;

  @Output()
  guardar = new EventEmitter<any>();

  @Output()
  cancelar = new EventEmitter<void>();

  formulario!: FormGroup;

  ngOnInit(): void {
    this.crearFormulario();

    if (this.usuarioEditar) {
      this.cargarDatos();
    }
  }

  crearFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(80)]],

      username: ['', [Validators.required, Validators.maxLength(50)]],

      password: [''],

      rol: ['', Validators.required],
    });
  }

  cargarDatos(): void {
    this.formulario.patchValue({
      nombre: this.usuarioEditar?.nombre,

      username: this.usuarioEditar?.username,

      password: '',

      rol: this.usuarioEditar?.rol,
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();

      return;
    }

    this.guardar.emit(this.formulario.value);
  }

  cerrar(): void {
    this.cancelar.emit();
  }
}
