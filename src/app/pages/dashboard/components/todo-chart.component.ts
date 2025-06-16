import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive } from 'ng-apexcharts';
import { Todo } from '../../../models/todo.model';

@Component({
  selector: 'app-todo-chart',
	standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './todo-chart.component.html',
  styleUrl: './todo-chart.component.scss'
})
export class TodoChartComponent implements OnChanges {
	@Input() todos: Todo[] = [];


	series: ApexNonAxisChartSeries = [];
  chart: ApexChart = {
    type: 'donut'
  };
  labels: string[] = ['Completadas', 'Pendientes'];
  colors: string[] = ['#198754', '#dc3545'];

	ngOnChanges(changes: SimpleChanges): void {
		console.log('%c<<< TodoChartComponent - ngOnChanges >>>', 'background: #ffc107; color: #000; padding: 2px 5px;');

		if (changes['todos']) {
			console.log('%c📊 Datos recibidos en chart:', 'background: #0dcaf0; color: #000; padding: 2px 5px;', this.todos); // Para el chart
			// ... el resto de tu lógica de cálculo
		}
    const completadas = this.todos.filter(t => t.completed).length;
    const pendientes = this.todos.length - completadas;
    this.series = [completadas, pendientes];
  }

}
