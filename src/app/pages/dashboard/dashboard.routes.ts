import { Routes } from '@angular/router';
import { ProfileComponent } from '../profile/profile.component';
import { TodoComponent } from '../todo/todo.component';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoEditComponent } from '../todo-edit/todo-edit.component';
import { ProfileViewComponent } from '../profile/profile-view.component';
import { ProfileEditComponent } from '../profile/profile-edit.component';
import { AnalyticsComponent } from '../dashboard/analytics/analytics.component'
import { UserRoleEditComponent } from '../admin/user-role-edit/user-role-edit.component';
import { AdminUserManagementComponent } from '../admin/admin-user-management/admin-user-management.component';
import { ClaimsRouterComponent } from '../../shared/claims-router/claims-router.component';

export const routes: Routes = [
	{
		path: '',
		children: [
			// ✅ Cuando entras a /dashboard → carga claims-router automáticamente
      { path: '', component: ClaimsRouterComponent },

			// ✅ También puedes acceder explícitamente
      { path: 'claims', component: ClaimsRouterComponent },

			// ✅ Otras rutas hijas
      { path: 'todo', component: TodoListComponent },
     /*  {
				path: 'edit-role/:uid',
				loadComponent: () =>
					import('../admin/user-role-edit/user-role-edit.component').then( m => m.UserRoleEditComponent)
			}, */
      {
				path: 'admin-users',
				children: [
					{
						path: '',
						loadComponent: () =>
							import('../admin/admin-user-management/admin-user-management.component')
								.then(m => m.AdminUserManagementComponent)
					},
					{
						path: 'edit-role/:uid',
						loadComponent: () =>
							import('../admin/user-role-edit/user-role-edit.component')
								.then(m => m.UserRoleEditComponent)
					},
					{
						path: 'profile-edit/:uid',
						loadComponent: () =>
							import('../profile/profile-edit.component')
								.then(m => m.ProfileEditComponent)
					}
				]
			},

			{
				path: 'analytics',
				loadComponent: () =>
					import('../dashboard/analytics/analytics.component').then(m => m.AnalyticsComponent)
			},
			{
				path: 'profile/:uid',
				loadComponent: () =>
					import('../profile/profile-view.component').then(m => m.ProfileViewComponent)
			},
			 
      // ✅ Ruta desconocida dentro del dashboard → claims-router
      { path: '**', redirectTo: '' },


			
			
		]
	}

	/* 
	
	
	{
    path: 'profile/:uid',
    component: ProfileComponent,
    children: [
      {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      },
      {
        path: 'view',
        loadComponent: () => import('../profile/profile-view.component').then(m => m.ProfileViewComponent)
      },
      {
        path: 'edit',
        loadComponent: () => import('../profile/profile-edit.component').then(m => m.ProfileEditComponent)
      }
    ]
  }
	
	*/
 /*  {
    path: 'profile/:uid',
    component: ProfileComponent,
    children: [
      {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full'
      },
      {
        path: 'view',
        loadComponent: () => import('../profile/profile-view.component').then(m => m.ProfileViewComponent)
      },
      {
        path: 'edit',
        loadComponent: () => import('../profile/profile-edit.component').then(m => m.ProfileEditComponent)
      }
    ]
  }, */
  /* {
    path: 'todo',
    component: TodoComponent
  },
  {
    path: 'todo-list',
    component: TodoListComponent
  },
  {
    path: 'todo-list/todo-edit/:id',
    component: TodoEditComponent
  },
	{
		path: 'analytics',
		component: AnalyticsComponent
	},
	{
		path: 'admin-users',
		loadComponent: () =>
			import('../admin/admin-user-management/admin-user-management.component').then(m => m.AdminUserManagementComponent)
	},
	{
		path: 'edit-role/:uid',
		loadComponent: () =>
			import('../admin/user-role-edit/user-role-edit.component').then( m => m.UserRoleEditComponent)
	}, */
	//{
  //  path: 'admin-claims',
  //  loadComponent: () =>
  //    import('../admin/admin-claims/admin-claims.component').then(m => m.AdminClaimsComponent)
  //},
  //{
  //  path: 'executive-claims',
  //  loadComponent: () =>
  //    import('../executive/executive-claims/executive-claims.component').then(m => m.ExecutiveClaimsComponent)
  //},
	/* {
		path: 'claims',
		loadComponent: () =>
			import('../../shared/claims-router/claims-router.component').then(m => m.ClaimsRouterComponent)
	},
	{
		path: 'claims-executive',
		loadComponent: () =>
			import('../../pages/executive/claims/executive-claims.component').then(m => m.ExecutiveClaimsComponent)
	},
  {
    path: '',
    redirectTo: 'analytics', // Puedes cambiar esto según tu ruta por defecto
    pathMatch: 'full'
  } */
];
