import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del servicio de autenticación
    const token = this.authService.getToken();

    // Clonar la request y agregar el header de autorización si existe el token
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Manejar la request y capturar errores
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el token es inválido o ha expirado (401), hacer logout
        if (error.status === 401) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
