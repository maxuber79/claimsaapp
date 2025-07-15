import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { TodoComponent } from './pages/todo/todo.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RegisterComponent } from './pages/register/register.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ProfileComponent } from './pages/profile/profile.component'
 



import { authGuard } from './guards/auth.guard';
import { redirectIfLoggedGuard } from './guards/redirect-if-logged.guard';




export const routes: Routes = [
	{
		path: '',
		redirectTo: 'login',
		pathMatch: 'full'
	},
	{
		path: 'login',
		loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
		canActivate: [redirectIfLoggedGuard]
	},
	{ path: 'register',
		loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [redirectIfLoggedGuard]
	},
	{ path: 'forgot', 
		loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
	canActivate: [redirectIfLoggedGuard]
	},	
	{ 
		path: 'dashboard', 
		component: DashboardComponent,
		canActivate: [authGuard], // protege todas las hijas
  	loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.routes) // 👈 OJO aquí
	}, 	
	{ path: 'welcome', component: WelcomeComponent, canActivate: [authGuard] },
	{ 
		path: '**', 
		loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
	 } //para pagina 404
	
];
