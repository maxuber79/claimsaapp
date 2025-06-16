import { Component, Input  } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-card-metric',
	standalone: true,
  imports: [CommonModule],
  templateUrl: './card-metric.component.html',
  styleUrl: './card-metric.component.scss'
})
export class CardMetricComponent {
	@Input() icon: string = '';
  @Input() count: string | number = '';
  @Input() label: string = '';
  @Input() color: string = 'primary';
  // 🆕 Props opcionales para footer
  @Input() footerText?: string;
  @Input() trendIcon?: string;
	@Input() trendIconLeft?: string;
}
