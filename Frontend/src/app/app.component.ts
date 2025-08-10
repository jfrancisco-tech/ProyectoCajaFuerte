
import { Component } from '@angular/core';
// RouterOutlet se importa solo para el decorador 'imports' en standalone components
// El warning 'All imports are unused' puede ignorarse, es necesario para Angular
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'caja-fuerte-app';
}
