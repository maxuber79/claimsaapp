import { Component, VERSION } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors  } from '@angular/forms';
import { Router } from '@angular/router';

// Firebase Auth y Firestore
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';


@Component({
  selector: 'app-register',
	standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

	imagePath: string = 'assets/images/webmain.svg';
	angularVersion: string | undefined = VERSION.full;
	myTitle: string = 'My first Claims';
	mySubTitle: string = `in Angular ${ this.angularVersion }`;
	textContent: string = 'Lorem ipsum dolor sit amet consectetur adipisicing elit Eveniet, itaque accusantium odio, soluta, corrupti aliquam quibusdam tempora at cupiditate quis eum maiores liber veritatis? Dicta facilis sint aliquid ipsum atque?';
	// Controla si se está cargando algo (por ejemplo, un formulario en espera)
	isLoading: boolean = false;

	passwordVisible: boolean = false;
	confirmPasswordVisible: boolean = false;




	// Definición del formulario
  registerForm!: FormGroup;


	constructor(
    private fb: FormBuilder,     // Para construir el formulario
    private auth: Auth,          // Servicio de Firebase Authentication
    private firestore: Firestore, // Servicio de Firestore
    private router: Router       // Para redireccionar después del registro
  ) {
		console.log('%c<<< start constructor >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;');
		// Inicialización del formulario con sus campos y validaciones
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      last_name: ['', Validators.required],
      user_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required]
    },{
			validators: [this.passwordMatchValidator]
		});
		


		console.log('%c<<< end component >>>', 'background: #198754; color: #ffffff; padding: 2px 5px;');
	}

	// 🔐 Validador que compara 'password' con 'confirmPassword'
  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }


	togglePasswordVisibility(): void {
		this.passwordVisible = !this.passwordVisible;
	}
	
	toggleConfirmPasswordVisibility(): void {
		this.confirmPasswordVisible = !this.confirmPasswordVisible;
	}

	// convenience getter for easy access to form fields
	get getControl() { 
		return this.registerForm.controls; 
	}
	/**
   * Método que se ejecuta al enviar el formulario.
   * Realiza el registro en Firebase Auth y guarda los datos en Firestore.
   */
  async onSubmit() {
		console.log('%c<<< click button resgister >>>', 'background: #6610f2; color: #ffffff; padding: 2px 5px;', this.registerForm.value);
		this.isLoading = true;

		if (this.registerForm.invalid) return;

    const { name, last_name, user_name, email, password } = this.registerForm.value;

		try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(this.firestore, 'users', uid), {
        name,
        last_name,
        user_name,
        email,
        created_at: new Date()
      });

      console.log('✅ Usuario registrado correctamente:', uid);
			alert(JSON.stringify(this.registerForm.value, null, 2));
      this.router.navigate(['/welcome']);
			this.isLoading = false;

    } catch (error: any) {
      console.error('❌ Error al registrar el usuario:', error);
      if (error.code === 'auth/email-already-in-use') {
				alert('Este correo ya está registrado. Intenta con otro.');
			} else {
				alert('Ocurrió un error al registrar el usuario. Intenta nuevamente.');
			}
    }


	}

	
}
