import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const usuario = localStorage.getItem('usuario');

  if (!usuario) {
    return next(req);
  }

  const usuarioLogueado = JSON.parse(usuario);

  const request = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'X-Usuario': usuarioLogueado.username,
    },
  });

  return next(request);
};
