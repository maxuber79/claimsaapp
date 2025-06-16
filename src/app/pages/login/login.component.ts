import { Component, VERSION } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validator, Validators } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';

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

	constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
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
    });
	}
	

	 

}
