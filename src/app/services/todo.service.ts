import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
	getDoc,
  collectionData,
  updateDoc,
  deleteDoc,
  Timestamp
} from '@angular/fire/firestore';
import { query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, switchMap, firstValueFrom, map } from 'rxjs';
import { Todo } from '../models/todo.model';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private authService: AuthService
  ) {
    console.log(
      '%c<<< Start TODO service >>>',
      'background: #fff3cd; color: #664d03; padding: 2px 5px;'
    );
  }

  /**
   * ✅ Agrega una nueva tarea con ID generado y guardado en Firestore
   * @param todoData Datos de la tarea (sin ID)
   * @returns Promise<void>
   */
  async addTodo(todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<void> {
    const user = await firstValueFrom(this.authService.getCurrentUser());
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const todosRef = collection(this.firestore, `users/${user.uid}/todos`);
    const newDocRef = doc(todosRef); // genera ID sin guardar
    const now = new Date();

    const todo: Todo = {
      ...todoData,
      id: newDocRef.id,
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    console.log('🧾 Creando tarea en:', `users/${user.uid}/todos/${newDocRef.id}`);
    console.log('📝 Datos:', todo);

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

  /**
   * ✏️ Actualiza una tarea específica por ID
   */
  async updateTodo(id: string, data: Partial<Todo>): Promise<void> {
    const user = await firstValueFrom(this.authService.getCurrentUser());
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const todoRef = doc(this.firestore, `users/${user.uid}/todos/${id}`);
    await updateDoc(todoRef, { ...data, updatedAt: Timestamp.now() });
  }

  /**
   * 🗑️ Elimina una tarea específica
   */
  async deleteTodo(id: string): Promise<void> {
    const user = await firstValueFrom(this.authService.getCurrentUser());
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const todoRef = doc(this.firestore, `users/${user.uid}/todos/${id}`);
    await deleteDoc(todoRef);
  }

  /**
   * 🧹 Elimina todas las tareas del usuario
   */
  async clearAllTodos(): Promise<void> {
    const todos = await firstValueFrom(this.getTodos());
    const user = await firstValueFrom(this.authService.getCurrentUser());
    if (!user?.uid) throw new Error('Usuario no autenticado');

    const deletions = todos!.map(todo =>
      deleteDoc(doc(this.firestore, `users/${user.uid}/todos/${todo.id}`))
    );

    await Promise.all(deletions);
  }


	getPendingTodosCount(): Observable<number> {
		return this.authService.getCurrentUser().pipe(
			switchMap(user => {
				const todosRef = collection(this.firestore, `users/${user.uid}/todos`);
				const queryRef = query(todosRef, where('completed', '==', false));
				return collectionData(queryRef).pipe(
					map(todos => todos.length)
				);
			})
		);
	}

	async getTodoById(id: string): Promise<Todo> {
		const user = await firstValueFrom(this.authService.getCurrentUser());
		if (!user?.uid) throw new Error('Usuario no autenticado');
	
		const todoRef = doc(this.firestore, `users/${user.uid}/todos/${id}`);
		const docSnap = await getDoc(todoRef);
	
		if (!docSnap.exists()) throw new Error('Tarea no encontrada');
	
		return docSnap.data() as Todo;
	}
	
	
}
