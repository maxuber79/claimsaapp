import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType, ChartOptions } from 'chart.js';

import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-line-chart',
	standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent {

	@Input() ticketsData!: { labels: string[], created: number[], solved: number[] };



	public lineChartData?: ChartConfiguration<'line'>['data'];
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true
  };

  constructor( private mockService: MockDataService ) {}


	ngOnChanges() {
    if (this.ticketsData) {
      this.lineChartData = {
        labels: this.ticketsData.labels,
        datasets: [
          {
            data: this.ticketsData.created,
            label: 'Tickets creados',
            borderColor: '#0d6efd',
            tension: 0.3
          },
          {
            data: this.ticketsData.solved,
            label: 'Tickets resueltos',
            borderColor: '#20c997',
            tension: 0.3
          }
        ]
      };
    }
  }






	/* public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    datasets: [
      {
        data: [12, 19, 3, 5, 2, 3, 9],
        label: 'Tickets creados',
        fill: true,
        tension: 0.5,
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13,110,253,0.2)',
        pointBackgroundColor: '#0d6efd'
      }
    ]
  };

	public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

  public lineChartLegend = true; */
}
