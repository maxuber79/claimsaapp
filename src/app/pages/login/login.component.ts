import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validator, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
	// FormGroup for the login form
	loginForm!: FormGroup;

	constructor(private fb: FormBuilder, private router: Router) {
		console.log('%c<<< Start constructor >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');

		this.loginForm = this.fb.group({
			username: ['',Validators.required],
			password: ['',Validators.required]
		 });

		//console.log('%c<<< loginForm >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;', this.loginForm.value);
		// Initialize the form with default values
		 console.log('%c<<< End constructor >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');

	 }

	 onSubmit() {
    const { username, password } = this.loginForm.value;
		console.log('%c<<< loginForm >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;', this.loginForm.value);
    if (username === 'admin' && password === '1234') {
      this.router.navigate(['/todo']);
    } else {
      alert('Credenciales incorrectas');
    }
  }

	 

}
