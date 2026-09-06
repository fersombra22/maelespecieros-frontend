import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import Swal from 'sweetalert2';

export type ChartOptions = {
  series: any;
  chart: any;
  xaxis: any;
  title: any;
  colors: any;
  plotOptions: any;
  dataLabels: any;
  stroke: any;
};

import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from '../../core/models/dashboard';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponse } from '../../core/models/login-response';
import { Rol } from '../../core/models/rol';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);

  private cdr = inject(ChangeDetectorRef);

  dashboard!: Dashboard;
  usuario?: LoginResponse;
  
  public chartOptions!: Partial<ChartOptions>;
  public aiInsight: string = '';
  public systemAltered: boolean = false;
  public Rol = Rol;

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuario() ?? undefined;
    this.cargarDashboard();
    
    if (this.usuario?.rol !== Rol.EMPLEADO) {
      this.cargarInsights();
    }
  }

  cargarDashboard(): void {
    this.dashboardService.obtenerDashboard().subscribe({
      next: (response: any) => {
        this.dashboard = response.data ? response.data : response;
        this.initChart();
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

  cargarInsights(): void {
    this.dashboardService.obtenerInsights().subscribe({
      next: (res: any) => {
        if (res.data) {
          this.aiInsight = res.data.insight;
          this.systemAltered = res.data.systemAltered;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error fetching AI insights', err)
    });
  }

  private initChart(): void {
    this.chartOptions = {
      series: [
        {
          name: 'Productos',
          data: [
            this.dashboard?.totalProductos || 0,
            this.dashboard?.productosActivos || 0,
            this.dashboard?.productosStockBajo || 0
          ]
        }
      ],
      chart: {
        height: 350,
        type: 'bar',
        fontFamily: 'Inter, sans-serif',
        toolbar: {
          show: false
        }
      },
      colors: ['#8b5cf6', '#10b981', '#f59e0b'],
      plotOptions: {
        bar: {
          columnWidth: '45%',
          distributed: true,
          borderRadius: 8
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600,
          colors: ['#ffffff']
        }
      },
      xaxis: {
        categories: ['Total', 'Activos', 'Stock Bajo'],
        labels: {
          style: {
            colors: ['#a1a1aa', '#a1a1aa', '#a1a1aa'],
            fontSize: '13px',
            fontWeight: 500
          }
        }
      },
      title: {
        text: 'Estado del Inventario',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#f8fafc'
        }
      }
    };
  }
}
