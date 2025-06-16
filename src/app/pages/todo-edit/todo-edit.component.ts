import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { TodoService } from '../../services/todo.service';
import { AlertService } from '../../services/alert.service';
import { Todo } from '../../models/todo.model';

@Component({
  standalone: true,
  selector: 'app-todo-edit',
  templateUrl: './todo-edit.component.html',
  styleUrls: ['./todo-edit.component.scss'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class TodoEditComponent implements OnInit {

  todoForm!: FormGroup;
  todoId!: string;
	isLoading: boolean = false;
	

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private todoService: TodoService,
    private alertService: AlertService 
  ) {
		this.todoForm = this.fb.group({
			title: ['', [Validators.required, Validators.minLength(3)]],
			description: [''],
			dueDate: [''],
			priority: ['', Validators.required]
		});
	}

  async ngOnInit() {
    this.todoId = this.route.snapshot.paramMap.get('id')!;
		console.log('%c<<< uid | TODO >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', this.todoId);

		
		

    /* this.todoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [''],
      priority: ['', Validators.required]
    }); */

    /*const todos = await this.todoService.getTodos().toPromise();
    const todo = todos?.find(t => t.id === this.todoId);

    if (todo) {
      this.todoForm.patchValue(todo);
    } else {
      this.alertService.error('Tarea no encontrada');
      this.router.navigate(['/dashboard']);
    } */
			

			if (this.todoId) {
				try {
					const todo = await this.todoService.getTodoById(this.todoId); // ✅ Esperamos la promesa
					console.log('%c✅ Tarea cargada:', 'color: #0d6efd;', todo);
					
					 this.todoForm.patchValue({
						title: todo.title,
						description: todo.description,
						dueDate: todo.dueDate ? this.formatDateForInput(todo.dueDate) : '',
						priority: todo.priority
					});
				} catch (error) {
					this.alertService.showToastError('Error al cargar la tarea');
					console.error('❌ Error al obtener tarea:', error);
					this.router.navigate(['/dashboard/todo-list']);
				}
			} else {
				this.alertService.error('ID de tarea no proporcionado');
				this.router.navigate(['/dashboard/todo-list']);
			}
 
  }

	private formatDateForInput(date: any): string {
		const d = new Date(date);
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0'); // +1 porque enero = 0
		const day = String(d.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}
	

	/* async loadTodo(): Promise<void> {
    try {
      const todo = await this.todoService.getTodoById(this.todoId);
			//console.log('%c<<< uid | todo >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', todo);
      if (todo) {
        this.todoForm.patchValue({
          title: todo.title,
          description: todo.description,
          dueDate: todo.dueDate,
          priority: todo.priority
        });
      } else {
        this.alertService.warning('Tarea no encontrada');
        this.router.navigate(['/dashboard/todo-list']);
      }
    } catch (error) {
      console.error('❌ Error al cargar la tarea', error);
      this.alertService.error('Error al cargar la tarea');
    }
  } */

  async onSubmit() {
		this.isLoading = true;
    if ( this.todoForm.invalid) return;

    try {
      await  this.todoService.updateTodo(this.todoId, this.todoForm.value);
      /* const formValue = this.todoForm.value;
      const updatePayload = {
        title: formValue.title ?? '',
        description: formValue.description ?? '',
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        priority: formValue.priority ?? ''
      }; */
			this.isLoading = false;
      this.todoService.updateTodo(this.todoId, this.todoForm.value);
			console.log('%c<<< onSubmit >>>', 'background: #20c997; color: #fff; padding: 2px 5px;', this.todoForm.value);
			 
			this.alertService.showToastSuccess('Tarea actualizada con éxito', 'Mensaje'); 
		 
      this.router.navigate(['/dashboard']);
    } catch (error) {
      this.alertService.error('Error al actualizar tarea');
    }
  }  
		/* onSubmit() {
			console.log('%c<<< onSubmit >>>', 'background: #d63384; color: #fff; padding: 2px 5px;', this.todoForm.value);
		} */
}
