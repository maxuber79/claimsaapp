import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // 👈 Importar esto
import { Todo } from '../../../models/todo.model';





@Component({
  selector: 'app-todo-stats',
	standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-stats.component.html',
  styleUrl: './todo-stats.component.scss'
})
export class TodoStatsComponent implements OnChanges , OnInit {

	@Input() todos: Todo[] = [];

	total = 0;
  completadas = 0;
  pendientes = 0;
  proximas = 0;


	//Varibales para tareas NO completadas
	//hoy: any = this.normalizarFecha(new Date());
	//enTresDias: any = this.normalizarFecha(new Date());
 hoy = new Date();
 hoyDate = new Date(this.hoy.getFullYear(), this.hoy.getMonth(), this.hoy.getDate());
 enTresDias = new Date(this.hoyDate);


	constructor() {console.log('%c<<< Start TodoStatsComponent >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;');
	}

	ngOnChanges(changes: SimpleChanges): void {
		console.log('%c<<< TodoStatsComponent - ngOnChanges >>>', 'background: #ffc107; color: #000; padding: 2px 5px;');
		if (changes['todos']) {
			console.log('%c 📈 Datos recibidos en stats:', 'background: #0dcaf0; color: #000; padding: 2px 5px;', this.todos);
		}
		// Normaliza hoy y enTresDias
		// Calcular fechas normalizadas a YYYY-MM-DD para evitar problemas de hora
		const hoyDate = new Date();
		const hoy = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), hoyDate.getDate());
		const enTresDias = new Date(hoy);
		enTresDias.setDate(hoy.getDate() + 3);
		
		console.log('%c📆 variables de fechas: ', 'background: #20c997; color: #ffffff; padding: 2px 5px;', hoyDate,hoy,enTresDias);
  this.proximas = this.todos.filter(t => {
    if (t.completed || !t.dueDate) return false;

    const due = new Date(t.dueDate);
    const fecha = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const esProxima = fecha >= hoy && fecha <= enTresDias;
    console.log(`📆 ${t.title} => ${fecha.toDateString()} | Proxima:`, esProxima);
    return esProxima;
  }).length;
	
		console.log('%c 🕜 this.proximas:', 'background: #0dcaf0; color: #000; padding: 2px 5px;', this.proximas);

		this.calcularEstadisticas();
	}

	ngOnInit(): void {
		console.log('%c<<< TodoStatsComponent - ngOnInit >>>', 'background: #0d6efd; color: #ffffff; padding: 2px 5px;');
	}
	

	calcularEstadisticas() {
    const hoy = new Date();
    this.total = this.todos.length;
    this.completadas = this.todos.filter(t => t.completed).length;
    this.pendientes = this.todos.filter(t => !t.completed).length;
    this.proximas = this.todos.filter(t => {
			if (!t.dueDate) return false; // Ignorar si no tiene fecha
		
			const fecha = new Date(t.dueDate);
			const hoy = new Date();
			const diff = (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
		
			return !t.completed && diff <= 3 && diff >= 0;
		}).length;
		
  }

	private normalizarFecha(fecha: Date): Date {
		return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
	}
	
	

}
