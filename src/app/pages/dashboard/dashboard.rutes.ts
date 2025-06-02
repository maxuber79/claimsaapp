import { Routes } from '@angular/router'; 
import { ProfileComponent } from '../profile/profile.component';
import { TodoComponent } from '../todo/todo.component';
import { TodoListComponent } from '../todo-list/todo-list.component';

const routes: Routes = [
  {
    path: 'profile/:uid',
    component: ProfileComponent
  }, 
	{ path: 'todo',
		component: TodoComponent
	},
	{ path: 'todo-list',
		component: TodoListComponent
	},
	{ path: '', 
		redirectTo: 'todo-list', 
		pathMatch: 'full' 
	}
];

export default routes;

//{ path: 'todo', component: TodoComponent , canActivate: [authGuard]},