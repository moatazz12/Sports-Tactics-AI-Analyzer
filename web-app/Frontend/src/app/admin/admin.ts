import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, User } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
  encapsulation: ViewEncapsulation.None
})
export class AdminComponent {
  users: User[] = [];
  showForm = false;
  isEdit = false;
  formUser: Partial<User> = {};
  editUserId: number | null = null;
  currentUser: any = null;
  showChangePasswordModal = false;
  adminPassword = { old: '', new: '', confirm: '' };
  adminInfo: User | null = null;
  showPassword: { [id: number]: boolean } = {};
  userToDelete: User | null = null;
  showPasswordField = false;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  toastMessage: string = '';
  showToast: boolean = false;
  toastError: boolean = false;

  // Ajout pour la sélection d'option (users/admin)
  selectedSection: string | null = null;

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {
    this.currentUser = this.authService.getCurrentUser();
    // Rediriger si non-admin
    if (!this.currentUser || this.currentUser.username !== 'admin') {
      this.router.navigate(['/home']);
    }
    this.refresh();
    // Récupérer les infos de l'admin pour le bloc coordonnées
    this.adminInfo = this.userService.getUsers().find(u => u.username === 'admin') || null;
  }

  refresh() {
    this.users = this.userService.getUsers().filter(u => u.username !== 'admin');
    this.cancel();
    // Réinitialise l'affichage des mots de passe
    this.showPassword = {};
  }

  openCreate() {
    this.showForm = true;
    this.isEdit = false;
    this.formUser = { role: 'user', name: '', phone: '', password: '' };
    this.editUserId = null;
  }

  openEdit(user: User) {
    this.showForm = true;
    this.isEdit = true;
    this.formUser = { ...user };
    this.editUserId = user.id;
  }

  save() {
    if (!this.formUser.username || !this.formUser.name || !this.formUser.email || !this.formUser.phone || (!this.isEdit && !this.formUser.password)) {
      this.showError('Veuillez remplir tous les champs.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.formUser.email || '')) {
      this.showError('Veuillez saisir un email valide (sans espaces, avec @ et un domaine).');
      return;
    }
    const phoneRegex = /^\d{8,}$/;
    if (!phoneRegex.test(this.formUser.phone || '')) {
      this.showError('Le numéro de téléphone doit contenir au minimum 8 chiffres.');
      return;
    }
    const password = this.formUser.password || '';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!this.isEdit && !passwordRegex.test(password)) {
      this.showError('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
      return;
    }
    if (this.isEdit && this.editUserId !== null) {
      // Si le champ mot de passe est vide, on ne le met pas à jour
      const userData = { ...this.formUser };
      if (!userData.password) {
        delete userData.password;
      }
      this.userService.updateUser(this.editUserId, userData as Omit<User, 'id'>);
      this.showNotification('Compte utilisateur modifié !');
    } else {
      this.userService.addUser(this.formUser as Omit<User, 'id'>);
      this.showNotification('Compte utilisateur créé !');
    }
    this.refresh();
  }

  delete(user: User) {
    this.confirmDelete(user);
  }

  cancel() {
    this.showForm = false;
    this.formUser = {};
    this.editUserId = null;
    this.isEdit = false;
  }

  logout() {
    this.authService.logout();
  }

  openChangePasswordModal() {
    this.showChangePasswordModal = true;
    this.adminPassword = { old: '', new: '', confirm: '' };
  }

  closeChangePasswordModal() {
    this.showChangePasswordModal = false;
    this.adminPassword = { old: '', new: '', confirm: '' };
  }

  changeAdminPassword() {
    if (!this.adminPassword.old || !this.adminPassword.new || !this.adminPassword.confirm) {
      this.showError('Veuillez remplir tous les champs.');
      return;
    }
    if (this.adminPassword.new !== this.adminPassword.confirm) {
      this.showError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    // Ici, tu pourrais appeler une API pour changer le mot de passe admin
    this.showNotification('Mot de passe modifié avec succès !');
    this.closeChangePasswordModal();
  }

  togglePassword(userId: number) {
    this.showPassword[userId] = !this.showPassword[userId];
  }

  confirmDelete(user: User) {
    this.userToDelete = user;
  }

  cancelDelete() {
    this.userToDelete = null;
  }

  deleteConfirmed() {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id);
      this.showNotification('Compte utilisateur supprimé !');
      this.refresh();
      this.userToDelete = null;
    }
  }

  showNotification(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    this.toastError = false;
    setTimeout(() => {
      this.showToast = false;
      this.toastError = false;
    }, 3500);
  }

  showError(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    this.toastError = true;
    setTimeout(() => {
      this.showToast = false;
      this.toastError = false;
    }, 3500);
  }

  // Ajout de la méthode pour sélectionner la section à afficher
  selectSection(section: string) {
    this.selectedSection = section;
  }
}
