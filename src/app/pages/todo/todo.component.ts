import { Component, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface TodoItem {
  id: number;
  title: string;
  completed: boolean;
}

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss'
})
export class TodoComponent {

	// 🔄 Cargar tareas desde localStorage al iniciar
  private stored = localStorage.getItem('todo-app-tasks');
  todos = signal<TodoItem[]>(this.stored ? JSON.parse(this.stored) : []);
	
	// Signal para el texto del input
	newTask = signal('');

	// ✅ Computed: tareas que aún no están completadas
  remainingTasks = computed(() =>
    this.todos().filter((todo) => !todo.completed).length
  );

	 // 🧠 effect: guarda automáticamente en localStorage cada vez que cambia la lista
	 constructor() {
    effect(() => {
      localStorage.setItem('todo-app-tasks', JSON.stringify(this.todos()));
    });
  }

// ➕ Agrega nueva tarea
addTask() {
	const title = this.newTask().trim();
	if (title) {
		const newTodo: TodoItem = {
			id: Date.now(),
			title,
			completed: false,
		};
		this.todos.update((prev) => [...prev, newTodo]);
		this.newTask.set('');
	}
}

	// ✅ Cambia el estado de completado
  toggleCompleted(id: number) {
    this.todos.update((items) =>
      items.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

	// Elimina una tarea según su id
  // 🗑️ Elimina una tarea
  deleteTask(id: number) {
    this.todos.update((items) => items.filter((todo) => todo.id !== id));
  }

	// Computed signal que calcula cuántas tareas están pendientes
  /* remainingTasks = computed(() =>
    this.todos().filter((todo) => !todo.completed).length
  ); */
}
