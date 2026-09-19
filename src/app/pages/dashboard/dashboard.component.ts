import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  labels: any;
};

import { DashboardService } from '../../core/services/dashboard.service';
import { Dashboard } from '../../core/models/dashboard';
import { AuthService } from '../../core/services/auth.service';
import { LoginResponse } from '../../core/models/login-response';
import { Rol } from '../../core/models/rol';
import { VentaService } from '../../core/services/venta.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, RouterModule],
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
  public payChartOptions!: Partial<ChartOptions>;
  public topChartOptions!: Partial<ChartOptions>;
  
  public aiInsight: string = '';
  public systemAltered: boolean = false;
  public Rol = Rol;

  public periodoSeleccionado: string = 'MES';
  public comparacionData: any = null;
  private ventaService = inject(VentaService);

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
        
        // Inicializar datos de comparación con los del dashboard (que por defecto son del mes)
        this.comparacionData = {
          actual: this.dashboard?.totalFacturado ?? 0,
          porcentajeVariacion: this.dashboard?.porcentajeVariacionMensual ?? 0
        };

        this.initCharts();
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

  cambiarPeriodoComparacion(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const periodo = selectElement.value;
    this.periodoSeleccionado = periodo;

    this.ventaService.compararVentas(periodo).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.comparacionData = {
            actual: res.data.actual,
            porcentajeVariacion: res.data.porcentajeVariacion
          };
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching sales comparison', err);
      }
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

  private initCharts(): void {
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
    
    // Top 5 Products Chart
    const topProducts = this.dashboard?.topProductos || [];
    this.topChartOptions = {
      series: [
        {
          name: 'Cantidad Vendida',
          data: topProducts.map(p => p.cantidadVendida)
        }
      ],
      chart: {
        height: 350,
        type: 'bar',
        fontFamily: 'Inter, sans-serif',
        toolbar: { show: false }
      },
      colors: ['#3b82f6'],
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: true
      },
      xaxis: {
        categories: topProducts.map(p => p.nombre),
        labels: {
          style: { colors: '#a1a1aa' }
        }
      },
      title: {
        text: 'Top 5 Productos Más Vendidos',
        align: 'left',
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#f8fafc'
        }
      }
    };

    // Payment Methods Pie Chart
    const payMethods = this.dashboard?.ventasPorMetodoPago || [];
    this.payChartOptions = {
      series: payMethods.map(p => p.total),
      chart: {
        height: 350,
        type: 'donut',
        fontFamily: 'Inter, sans-serif'
      },
      labels: payMethods.map(p => p.formaPago),
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
      stroke: { show: false },
      dataLabels: { enabled: true },
      title: {
        text: 'Ingresos por Medio de Pago',
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
