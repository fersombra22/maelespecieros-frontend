import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Rol } from './core/models/rol';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cambiar-password',
    loadComponent: () =>
      import('./pages/cambiar-password/cambiar-password.component').then(
        (m) => m.CambiarPasswordComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./pages/productos/productos.component').then((m) => m.ProductosComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./pages/categorias/categorias.component').then((m) => m.CategoriasComponent),
        canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMIN])],
      },
      {
        path: 'movimientos',
        loadComponent: () =>
          import('./pages/movimientos/movimientos.component').then((m) => m.MovimientosComponent),
        canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMIN])],
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./pages/ventas/ventas.component').then((m) => m.VentasComponent),
      },
      {
        path: 'ventas/historial',
        loadComponent: () =>
          import('./pages/ventas/historial-ventas/historial-ventas.component').then(
            (m) => m.HistorialVentasComponent,
          ),
        canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMIN])],
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/clientes/clientes.component').then((m) => m.ClientesComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component').then((m) => m.UsuariosComponent),
        canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMIN])],
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./pages/reportes/reportes.component').then((m) => m.ReportesComponent),
        canActivate: [roleGuard([Rol.SUPER_ADMIN, Rol.ADMIN])],
      },

      {
        path: 'blockchain',
        loadComponent: () =>
          import('./pages/blockchain/blockchain.component').then((m) => m.BlockchainComponent),
        canActivate: [roleGuard([Rol.SUPER_ADMIN])],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
