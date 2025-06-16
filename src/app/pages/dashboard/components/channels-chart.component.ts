import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-channels-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './channels-chart.component.html',
  styleUrl: './channels-chart.component.scss'
})
export class ChannelsChartComponent implements OnChanges, OnInit {

  @Input() channels: { name: string; value: number }[] = [];


	ngOnInit(): void {
    console.log('%c[ngOnInit] Valor inicial del @Input ChannelsChartComponent:','background-color:#d63384;color:#ffffff,padding:.5rem',this.channels);
  }
	 

  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        label: 'Tickets por canal',
        data: [],
        backgroundColor: ['#0d6efd', '#6610f2', '#6f42c1', '#d63384']
      }
    ]
  };

	chartType: ChartType = 'bar';

   

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['channels'] && this.channels?.length) {
			console.log('🔄 [ngOnChanges] Nuevo valor:', this.channels);
      this.updateChartData();
    }
	}

	updateChartData(): void {
		this.chartData = {
			labels: this.channels.map(c => c.name),
			datasets: [
				{
					label: 'Tickets por canal',
					data: this.channels.map(c => c.value),
					backgroundColor: ['#0d6efd', '#6610f2', '#6f42c1', '#d63384']
				}
			]
		};
	}
}
