import { Injectable } from '@angular/core';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    { id: 1, username: 'admin', name: 'Admin', email: 'admin@email.com', phone: '0600000000', password: 'admin123', role: 'admin' },
    { id: 2, username: 'user1', name: 'User One', email: 'user1@email.com', phone: '0611111111', password: 'user1pass', role: 'user' },
    { id: 3, username: 'user2', name: 'User Two', email: 'user2@email.com', phone: '0622222222', password: 'user2pass', role: 'user' }
  ];
  private nextId = 4;

  getUsers(): User[] {
    return [...this.users];
  }

  addUser(user: Omit<User, 'id'>): void {
    this.users.push({ ...user, id: this.nextId++ });
  }

  updateUser(id: number, user: Omit<User, 'id'>): void {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.users[idx] = { ...user, id };
    }
  }

  deleteUser(id: number): void {
    this.users = this.users.filter(u => u.id !== id);
  }
} 