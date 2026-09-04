import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (
  req,

  next,
) => {
  const token = localStorage.getItem('token');

  if (token && token !== 'null') {
    return next(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }

  return next(req);
};
