import { Component, VERSION } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validator, Validators } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';

@Component({
    selector: 'app-login',
		standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {

	imagePath: string = 'assets/images/webmain.svg';
	angularVersion: string | undefined = VERSION.full; // Accede a la versión
	myTitle: string = 'My first Claims';
	mySubTitle: string = `in Angular ${ this.angularVersion }`;
	textContent: string = 'Lorem ipsum dolor sit amet consectetur adipisicing elit Eveniet, itaque accusantium odio, soluta, corrupti aliquam quibusdam tempora at cupiditate quis eum maiores liber veritatis? Dicta facilis sint aliquid ipsum atque?';
	

	// FormGroup for the login form
	loginForm!: FormGroup;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private authService: AuthService,
		private alertService: AlertService )
		{
		console.log('%c<<< Start constructor >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');

		this.loginForm = this.fb.group({
			email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
		 });

		//console.log('%c<<< loginForm >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;', this.loginForm.value);
		// Initialize the form with default values
		 console.log('%c<<< End constructor >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');

	 }

	 async onSubmit() {
		if (this.loginForm.invalid) return;
	
		const { email, password } = this.loginForm.value;
	
		this.authService.login(email, password)
    .then(userCredential => {
      const uid = userCredential.user.uid;
      console.log('✅ Login exitoso. UID:', uid);
      this.router.navigate(['/dashboard']); // o pasa el UID si quisieras: ['/dashboard', uid]
    })
    .catch(error => {
      console.error('❌ Error de login:', error);
			 // 🚨 Control de errores de Firebase
     // 🚨 Manejo de errores específicos de Firebase
        switch (error.code) {
          case 'auth/invalid-credential':
            this.alertService.showToastError('El usuario o la contraseña son incorrectos.', 'Error de autenticación');
            break;
          case 'auth/user-not-found':
            this.alertService.showToastError('No se encontró un usuario con este correo electrónico.', 'Error de autenticación');
            break;
          case 'auth/wrong-password':
            this.alertService.showToastError('La contraseña es incorrecta.', 'Error de autenticación');
            break;
          case 'auth/user-disabled':
            this.alertService.showToastError('Tu cuenta ha sido deshabilitada. Contacta al soporte.', 'Cuenta deshabilitada');
            break;
          case 'auth/too-many-requests':
            this.alertService.showToastError('Demasiados intentos fallidos. Inténtalo más tarde.', 'Demasiados intentos');
            break;
          default:
            this.alertService.showToastError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.', 'Error');
            break;
        }
    });
	}
	

	 

}
