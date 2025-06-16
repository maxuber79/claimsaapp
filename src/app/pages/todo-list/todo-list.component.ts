import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { ActivatedRoute,Router, RouterModule } from '@angular/router';
 
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { Todo } from '../../models/todo.model';
import { AlertService } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent implements OnInit {
  todoForm!: FormGroup;

	todos: Todo[] = [];
	otraCondicion: boolean = true; // Ejemplo: Inicialízala como 'false'
	condicion: boolean = true; 
  constructor(
    private todoService: TodoService,
    private alertService: AlertService,
    private fb: FormBuilder,
    private authService: AuthService,
		private route: ActivatedRoute,
		private router: Router,
  ) {
    console.log('%c<<< Constructor TODO-LIST >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');
		// Inicializar el formulario
    this.todoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [null],
      priority: ['', Validators.required]
    });

  }

  async ngOnInit(): Promise<void> {
    console.log('%c<<< ngOnInit TODO-LIST >>>', 'background: #6610f2; color: #ffffff; padding: 2px 5px;');

    // Validar existencia del usuario (por debug)
    const user = await firstValueFrom(this.authService.getCurrentUser());
    if (!user || !user.uid) {
      this.alertService.error('Usuario no autenticado');
      console.error('❌ Usuario no autenticado');
      return;
    }
    console.log('🟢 Usuario autenticado:', user.uid);

    
		this.todoService.getTodos().subscribe(todos => {
			this.todos = todos;
			console.log('📋 Tareas recibidas:', this.todos);
		});
  }

  async onSubmit(): Promise<void> {
    if (this.todoForm.invalid) {
      this.todoForm.markAllAsTouched();
      this.alertService.warning('Por favor, completa todos los campos requeridos.');
      return;
    }

    const formValue = this.todoForm.value;
    console.log('%c📤 Enviando tarea a Firestore:', 'color: #0d6efd', formValue);

    try {
			console.log('📤 Enviando tarea al servicio TodoService...');

      await this.todoService.addTodo({
        title: formValue.title,
        description: formValue.description,
        dueDate: formValue.dueDate,
        priority: formValue.priority
      });

      this.alertService.success('Tu tarea fue guardada correctamente');
      console.log('%c✅ Tarea guardada con éxito', 'color: #198754');
      this.todoForm.reset();
    } catch (error) {
      this.alertService.error('Ocurrió un error al guardar la tarea');
      console.error('%c❌ Error al guardar tarea:', 'color: red', (error as any)?.message ?? error);
    }
  }

	async deleteTodo(id: string) {
		const result = await this.alertService.confirm('¿Deseas eliminar esta tarea?');
		if (result.isConfirmed) {
			try {
				await this.todoService.deleteTodo(id);
				this.alertService.success('Tarea eliminada correctamente');
			} catch (error) {
				console.error('❌ Error al eliminar tarea:', error);
				this.alertService.error('No se pudo eliminar la tarea');
			}
		}
	}

	async toggleComplete(todo: Todo) {
		try {
			const newStatus = !todo.completed;
			await this.todoService.updateTodo(todo.id!, { completed: newStatus });
	
			if (newStatus) {
				this.alertService.showToastSuccess('Marcado como completado', 'Éxito');
			} else {
				this.alertService.showToastWarning('Marcado como pendiente', 'Atención');
			}
	
		} catch (error) {
			this.alertService.showToastError('No se pudo actualizar el estado', 'Error');
			console.error(error);
		}
	}
	

	async clearAll() {
		const result = await this.alertService.confirm('¿Eliminar todas las tareas?');
		if (result.isConfirmed) {
			try {
				await this.todoService.clearAllTodos();
				this.alertService.success('Todas las tareas fueron eliminadas');
			} catch (error) {
				console.error('❌ Error al limpiar tareas:', error);
				this.alertService.error('No se pudieron eliminar las tareas');
			}
		}
	}
	
	editTodo(todoId: string): void {
		this.router.navigate(['/dashboard/todo-list/todo-edit/', todoId]);
	}

	testAlert() {
		//this.alertService.info('Esta es una alerta de información');
		this.alertService.showToastSuccess('¡Todo salió bien!', 'Éxito');
		console.log('%cℹ️ Alerta de información mostrada', 'color: #0dcaf0');
	}
	
}
