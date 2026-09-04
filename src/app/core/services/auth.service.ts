import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import { LoginRequest } from '../models/login-request';
import { ApiResponse } from '../models/api-response';
import { LoginResponse } from '../models/login-response';

export interface CambiarPasswordRequest {
  username: string;

  passwordActual: string;

  passwordNueva: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  login(request: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(
      `${this.apiUrl}/login`,

      request,
    );
  }

  cambiarPassword(request: CambiarPasswordRequest): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(
      `${this.apiUrl}/cambiar-password`,

      request,
    );
  }

  guardarUsuario(usuario: LoginResponse): void {
    localStorage.setItem(
      'usuario',

      JSON.stringify(usuario),
    );

    if (usuario.token) {
      localStorage.setItem(
        'token',

        usuario.token,
      );
    }
  }

  obtenerUsuario(): LoginResponse | null {
    const data = localStorage.getItem('usuario');

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  estaLogueado(): boolean {
    return this.obtenerToken() !== null;
  }

  requiereCambioPassword(): boolean {
    const usuario = this.obtenerUsuario();

    return usuario?.requiereCambioPassword ?? false;
  }

  cerrarSesion(): void {
    localStorage.removeItem('usuario');

    localStorage.removeItem('token');
  }
}
