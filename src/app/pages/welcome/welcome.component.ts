import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-welcome',
	standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
// Simulación: podrías obtener estos datos del usuario logueado si ya usas un servicio
userName: string = 'Nuevo Usuario';
// Controla si se está cargando algo (por ejemplo, un formulario en espera)
isLoading: boolean = false;
 /**
   * Navega al dashboard o a la página principal luego de la bienvenida
   */

 constructor(private router: Router) {}

	goToDashboard() {
		setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    }, 2000); // Simula un retardo como una petición HTTP
		 
	}

}
