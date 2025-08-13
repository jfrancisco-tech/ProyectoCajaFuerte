import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { LoginComponent } from './components/login/login.component';
import { LayoutComponent } from './components/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      // Aquí puedes agregar más rutas que usen el layout
      // { path: 'acceso-rfid', component: AccesoRfidComponent },
      // { path: 'acceso-pin', component: AccesoPinComponent },
      // { path: 'eventos', component: EventosComponent },
      // { path: 'auditoria', component: AuditoriaComponent },
      // { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AdminGuard] },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
