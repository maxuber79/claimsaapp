import { Routes } from '@angular/router'; 
import { ProfileComponent } from '../profile/profile.component';
import { TodoComponent } from '../todo/todo.component';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoEditComponent } from '../todo-edit/todo-edit.component';

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
	{ path: 'todo-list/todo-edit/:id',
		component: TodoEditComponent
	},
	{ path: '', 
		redirectTo: 'todo-list', 
		pathMatch: 'full' 
	}
];

export default routes;

//{ path: 'todo', component: TodoComponent , canActivate: [authGuard]},