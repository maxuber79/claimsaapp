import { Component, VERSION } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validator, Validators } from '@angular/forms'; 
import { Router, RouterModule } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-forgot-password',
	standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
	imagePath: string = 'assets/images/webmain.svg';
	angularVersion: string | undefined = VERSION.full;
	myTitle: string = 'My first Claims';
	mySubTitle: string = `in Angular ${ this.angularVersion }`;
	textContent: string = 'Lorem ipsum dolor sit amet consectetur adipisicing elit Eveniet, itaque accusantium odio, soluta, corrupti aliquam quibusdam tempora at cupiditate quis eum maiores liber veritatis? Dicta facilis sint aliquid ipsum atque?';
	form!: FormGroup;
  message: string = '';
  error: string = '';
	isLoading: boolean = false;

	constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {

		console.log('%c<<< Start constructor >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

	// convenience getter for easy access to form fields
	get getControl() { 
		return this.form.controls; 
	}

	async onSubmit() {
		console.log('%c<<< click button resgister >>>', 'background: #6610f2; color: #ffffff; padding: 2px 5px;', this.form.value);
    const email = this.form.value.email;
    try {
      await this.authService.resetPassword(email);
      this.message = '📬 Te enviamos un enlace para restablecer tu contraseña';
      this.error = '';
			this.router.navigate(['/login']);
    } catch (err: any) {
      this.error = '❌ Error: ' + err.message;
      this.message = '';
    }
  }


}
