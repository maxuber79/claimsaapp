import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { AdminClaimsComponent } from '../../pages/admin/claims/admin-claims.component';
import { ExecutiveClaimsComponent } from '../../pages/executive/claims/executive-claims.component';
import { UserService } from '../../services/user.service';
import { ClaimsDummyService } from '../../services/claims-dummy.service';

@Component({
  selector: 'app-claims-router',
  standalone: true,
  imports: [CommonModule, NgIf, AdminClaimsComponent, ExecutiveClaimsComponent],
  templateUrl: './claims-router.component.html',
  styleUrls: ['./claims-router.component.scss']
})
export class ClaimsRouterComponent implements OnInit {
  role: string | null = null;
  showAdmin = false;
  showExecutive = false;

  constructor(private userService: UserService, private claimsDummyService: ClaimsDummyService) {}

  ngOnInit(): void {
		this.userService.getCurrentUserRole().subscribe(role => {
			console.log('🧪 Rol recibido desde el servicio:', role);
			this.role = role;
			if (role === 'Administrador') {
				this.showAdmin = true;
			} else if (role === 'Ejecutivo') {
				this.showExecutive = true;
			} else {
				console.warn('⚠️ Rol no reconocido:', role);
			}
		});


		/* const uid = '0FnJKfeUI2T73kBGO5GCdlpUs6W2';
		this.claimsDummyService.getClaimsByUid(uid).subscribe(claims => {
			console.log('📄 Reclamos del usuario:', claims);
		}); */
		this.claimsDummyService.getAllClaims().subscribe(claims => {
			console.log('📄 Reclamos de todos los usuarios:', claims);
		}); 


		this.claimsDummyService.getClaimsByUser('0FnJKfeUI2T73kBGO5GCdlpUs6W2').subscribe({
			next: claims => {
				console.log('📄 Reclamos del usuario:', claims);
			},
			error: error => {
				console.error('❌ Error al obtener los reclamos:', error);
			}
		});		
	}
	
}
