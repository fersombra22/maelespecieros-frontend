import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from '../../core/models/dashboard';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponse } from '../../core/models/login-response';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  // INYECCIÓN FORENSE: Agregamos el detector de cambios para forzar la vista
  private cdr = inject(ChangeDetectorRef);

  dashboard!: Dashboard;
  usuario?: LoginResponse;

  ngOnInit(): void {
    console.log('INICIANDO DASHBOARD');
    this.usuario = this.authService.obtenerUsuario() ?? undefined;
    console.log('USUARIO:', this.usuario);

    this.cargarDashboard();
  }

  cargarDashboard(): void {
    console.log('CONSULTANDO DASHBOARD...');

    this.dashboardService.obtenerDashboard().subscribe({
      next: (response: any) => {
        console.log('RESPUESTA DASHBOARD BRUTA:', response);

        // CORRECCIÓN FORENSE: Si el backend manda el objeto directo, usamos 'response'.
        // Si lo manda envuelto en 'data', usamos 'response.data'.
        this.dashboard = response.data ? response.data : response;

        console.log('DASHBOARD ASIGNADO A LA VISTA:', this.dashboard);

        // CORRECCIÓN FORENSE: Obligamos a Angular a actualizar el HTML en este exacto momento
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('ERROR DASHBOARD', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar dashboard.',
        });
      },
    });
  }
}
