import { Component } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { FormsModule } from '@angular/forms'; // 👈 importante
import { Todo } from '../../models/todo.model';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alert.service'; // Importado
@Component({
  selector: 'app-todo-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.scss'
})
export class TodoListComponent {
	newTodo: Partial<Todo> = {};
	/* newTodo: Partial<Todo> = {
    title: '',
    description: '',
    dueDate: undefined,
    priority: ''
  }; */

	constructor(private todoService: TodoService, private alertService: AlertService) {}


	async onSubmit(): Promise<void> {
    try {
      if (!this.newTodo.title) return;

      await this.todoService.addTodo({
				title: this.newTodo.title!,
				description: this.newTodo.description,
				dueDate: this.newTodo.dueDate,
				priority: this.newTodo.priority,
			});
			this.alertService.success('Tu tarea fue guardada correctamente');
      console.log('✅ Tarea guardada con éxito');

      // Reiniciar el formulario
      this.newTodo = {};
    } catch (error) {
			this.alertService.error('Ocurrió un error al guardar la tarea');
      console.error('❌ Error al guardar tarea:', error);
    }
  }
}
