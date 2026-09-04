import { Rol } from './rol';

export interface LoginResponse {
  id: number;

  nombre: string;

  username: string;

  rol: Rol;

  token: string | null;

  requiereCambioPassword: boolean;
}
