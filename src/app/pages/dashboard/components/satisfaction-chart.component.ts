import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartType, ChartData } from 'chart.js';

@Component({
  selector: 'app-satisfaction-chart',
	standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './satisfaction-chart.component.html',
  styleUrl: './satisfaction-chart.component.scss'
})
export class SatisfactionChartComponent {
	@Input() positive = 0;
  @Input() negative = 0;

	public doughnutChartType: ChartType = 'doughnut';

	doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Positiva', 'Negativa'],
    datasets: [{
      data: [0, 0], // Inicial
      backgroundColor: ['#4CAF50', '#F44336']
    }]
  };
   

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['positive'] || changes['negative']) {
      this.updateChartData();
    }
  }

	updateChartData() {
    this.doughnutChartData = {
      labels: ['Positiva', 'Negativa'],
      datasets: [{
        data: [this.positive, this.negative],
        backgroundColor: ['#4CAF50', '#F44336']
      }]
    };
  }
}
