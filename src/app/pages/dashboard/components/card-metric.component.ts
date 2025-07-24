import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClaimsService } from '../../../services/claims.service';
import { Claim } from '../../../models/claims';
@Component({
  selector: 'app-card-metric',
	standalone: true,
  imports: [CommonModule],
  templateUrl: './card-metric.component.html',
  styleUrl: './card-metric.component.scss'
})
export class CardMetricComponent implements OnInit {

	
	@Input() icon: string = '';
  @Input() count: string | number = '';
  @Input() label: string = '';
  @Input() color: string = 'primary';
  // 🆕 Props opcionales para footer

  constructor(private claimsService: ClaimsService) {}

  ngOnInit(): void {
    // Aquí puedes realizar alguna acción al inicializar el componente
  }
  @Input() footerText?: string;
  @Input() trendIcon?: string;
	@Input() trendIconLeft?: string;
}
