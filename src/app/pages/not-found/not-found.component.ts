import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-not-found',
	standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

	constructor( private router: Router ) {
		console.log('%c<<< Start constructor >>>', 'background: #fff3cd; color: #664d03; padding: 2px 5px;');
	}
}
