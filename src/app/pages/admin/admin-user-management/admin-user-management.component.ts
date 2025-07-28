import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { UserModel } from '../../../models/user'; // ajusta la ruta si la tenís distinta
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service'; 
import { Router, RouterModule } from '@angular/router';
@Component({
	standalone: true,
  selector: 'app-admin-user-management',
	imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss']
})
export class AdminUserManagementComponent implements OnInit {


  users: UserModel[] = [];
  filteredUsers: UserModel[] = [];
  searchTerm: string = '';


	

	loading: boolean = true;
	isSaving: boolean = false;
	isLoading: boolean = true;

  constructor( private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe((users: UserModel[]) => {
      this.users = users;
      this.filteredUsers = users;
			this.isLoading = false;
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term)
    );
  }

  toggleUserStatus(user: UserModel): void {
    const newStatus = !user.activo;
    this.userService.toggleUserStatus(user.uid, newStatus).then(() => {
      user.activo = newStatus;
    });
  }

	toggleUser(uid: string, nuevoEstado: boolean) {
		this.userService.toggleUserStatus(uid, nuevoEstado).then(() => {
			// Opcional: notificar al usuario
		});
	}

	editUser(uid: string, nuevoEstado: boolean) {
		 console.log('Editando usuario con UID:', uid, 'Nuevo estado:', nuevoEstado);

  	this.router.navigate(['/dashboard/admin-users/profile-edit', uid]);

	}
}
