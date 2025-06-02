import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {

  // Nombre del usuario
  userName: string = '';

  // Estado de carga
  isLoading: boolean = true;

  // Control de visibilidad de contraseña
  passwordVisible: boolean = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    // Escucha de sesión persistente para refrescos
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const ref = doc(this.firestore, `users/${user.uid}`);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            this.userName = data['name'] || 'Usuario';
          } else {
            this.userName = 'Usuario';
          }
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
          this.userName = 'Usuario';
        }
      }
      this.isLoading = false;
    });
  }

  /**
   * Alterna la visibilidad del campo de contraseña
   */
  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Redirige al dashboard
   */
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Simula una acción que muestra un spinner y redirige
   */
  simulateFormSubmit() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/dashboard']);
    }, 2000);
  }
}
