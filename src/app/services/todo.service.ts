import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, collectionData, addDoc, updateDoc, deleteDoc, docData, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, switchMap } from 'rxjs';
import { Todo } from '../models/todo.model';
import { User } from 'firebase/auth';
import { AuthService } from '../services/auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class TodoService {
	/**  
	* Servicio Angular para gestionar los To-Dos. Este servicio se encargará de:
	* 	Obtener las tareas del usuario autenticado.
	* 	Agregar una nueva tarea.
	* 	Editar una tarea existente.
	* 	Eliminar una tarea (individual o todas).
	* 	Marcar una tarea como completada o no.
	*/
	//private user: User | null = null;
	//private id!: string; // antes podía ser opcional o `string | undefined`

  constructor( private firestore: Firestore, private auth: Auth, private authService: AuthService) { console.log('%c<<< Start TODO service >>>','background: #fff3cd; color: #664d03; padding: 2px 5px;');
		/* this.auth.onAuthStateChanged((user) => {
      this.user = user;
    }); */
	}
	/* private getUserTodosCollection() {
    if (!this.user) throw new Error('Usuario no autenticado');
    return collection(this.firestore, `users/${this.user.uid}/todos`);
  } */

	/**
   * ✅ Agrega una nueva tarea con ID generado y guardado en Firestore
   * @param todoData Datos de la tarea (sin ID)
   * @returns Promise<void>
   */
  async addTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<void> {
    const user = await this.authService.getCurrentUser().toPromise();
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const todosRef = collection(this.firestore, `users/${user.uid}/todos`);
    const newDocRef = doc(todosRef); // genera ID
    const now = new Date();

    const todo: Todo = {
      ...todoData,
      id: newDocRef.id,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(newDocRef, todo);
  }

  /**
   * 📦 Obtiene todos los todos en tiempo real
   */
	getTodos(): Observable<Todo[]> {
    return this.authService.getCurrentUser().pipe(
      switchMap(user => {
        const todosRef = collection(this.firestore, `users/${user.uid}/todos`);
        return collectionData(todosRef, { idField: 'id' }) as Observable<Todo[]>;
      })
    );
  }

  /* addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<any> {
    const now = Timestamp.now();
    return addDoc(this.getUserTodosCollection(), {
      ...todo,
      createdAt: now,
      updatedAt: now,
      completed: false
    });
  } */
 /**
   * ✏️ Actualiza una tarea específica por ID
   */

 async updateTodo(id: string, data: Partial<Todo>): Promise<void> {
	const user = await this.authService.getCurrentUser().toPromise();
	if (!user?.uid) throw new Error('Usuario no autenticado');

	const todoRef = doc(this.firestore, `users/${user.uid}/todos/${id}`);
	await updateDoc(todoRef, { ...data, updatedAt: Timestamp.now() });
}

	/**
   * 🗑️ Elimina una tarea específica
   */
  async deleteTodo(id: string): Promise<void> {
    const user = await this.authService.getCurrentUser().toPromise();
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const todoRef = doc(this.firestore, `users/${user.uid}/todos/${id}`);
    await deleteDoc(todoRef);
  }

	/**
   * 🧹 Elimina todas las tareas del usuario
   */
  async clearAllTodos(): Promise<void> {
    const todos = await this.getTodos().toPromise();
    const user = await this.authService.getCurrentUser().toPromise();
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const deletions = todos!.map(todo =>
      deleteDoc(doc(this.firestore, `users/${user.uid}/todos/${todo.id}`))
    );

    await Promise.all(deletions);
  }
}
