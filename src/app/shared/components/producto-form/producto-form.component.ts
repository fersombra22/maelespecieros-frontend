import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Categoria } from '../../../core/models/categoria';

import { CategoriaService } from '../../../core/services/categoria.service';

import { Producto } from '../../../core/models/producto';

@Component({
  selector: 'app-producto-form',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './producto-form.component.html',

  styleUrls: ['./producto-form.component.css'],
})
export class ProductoFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  private categoriaService = inject(CategoriaService);

  @Input()
  productoEditar?: Producto;

  @Output()
  guardar = new EventEmitter();

  @Output()
  cancelar = new EventEmitter();

  formulario!: FormGroup;

  categorias: Categoria[] = [];

  ngOnInit(): void {
    this.crearFormulario();

    this.cargarCategorias();
  }

  crearFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],

      descripcion: [''],

      modelo: ['', Validators.required],

      precioEfectivo: [0, Validators.min(0)],

      costo: [0, Validators.min(0)],

      stock: [0, Validators.min(0)],

      stockMinimo: [0, Validators.min(0)],

      categoriaId: [null, Validators.required],
    });
  }

  cargarCategorias(): void {
    this.categoriaService
      .listar()

      .subscribe({
        next: (response) => {
          this.categorias = response.data.content;

          if (this.productoEditar) {
            this.cargarDatos();
          }
        },

        error: (error) => {
          console.error(
            'Error cargando categorías:',

            error,
          );
        },
      });
  }

  cargarDatos(): void {
    this.formulario.patchValue({
      nombre: this.productoEditar?.nombre,

      descripcion: this.productoEditar?.descripcion,

      modelo: this.productoEditar?.modelo,

      precioEfectivo: this.productoEditar?.precioEfectivo,

      costo: this.productoEditar?.costo,

      stock: this.productoEditar?.stock,

      stockMinimo: this.productoEditar?.stockMinimo,

      categoriaId: this.productoEditar?.categoriaId,
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
