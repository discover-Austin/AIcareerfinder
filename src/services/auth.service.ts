import { Injectable, signal } from '@angular/core';
import { User, UserResult } from '../models/user.model';
import { FullAnalysis } from '../models/personality-test.model';
import { UserSubscription } from '../models/subscription.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'career-finder-users';
  private readonly SESSION_KEY = 'career-finder-session';

  currentUser = signal<User | null>(null);

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    try {
      const userId = localStorage.getItem(this.SESSION_KEY);
      if (userId) {
        const users = this.getUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
          this.currentUser.set(user);
        } else {
          // Clean up if session user doesn't exist
          localStorage.removeItem(this.SESSION_KEY);
        }
      }
    } catch (e) {
      console.error('Error loading session:', e);
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  register(name: string, email: string, password: string): { success: boolean, message: string } {
    const users = this.getUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password, // In a real app, hash and salt this password
      results: [],
      testsTaken: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    return this.login(email, password);
  }

  login(email: string, password: string): { success: boolean, message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== password) {
      return { success: false, message: 'Invalid email or password.' };
    }
    
    this.currentUser.set(user);
    localStorage.setItem(this.SESSION_KEY, user.id);
    return { success: true, message: 'Login successful!' };
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(this.SESSION_KEY);
  }

  saveResult(analysis: FullAnalysis): void {
    const user = this.currentUser();
    if (!user) return;

    const newResult: UserResult = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      archetype: analysis.archetype.name,
      analysis: analysis,
    };
    
    user.results.unshift(newResult); // Add to the beginning of the list

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex > -1) {
      users[userIndex] = user;
      this.saveUsers(users);
      this.currentUser.set({ ...user }); // Update signal to trigger components
    }
  }

  private getUsers(): User[] {
    try {
      const usersJson = localStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
      console.error('Error getting users from localStorage:', e);
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Error saving users to localStorage:', e);
    }
  }

  updateUserSubscription(subscription: UserSubscription): void {
    const user = this.currentUser();
    if (!user) return;

    user.subscription = subscription;

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex > -1) {
      users[userIndex] = user;
      this.saveUsers(users);
      this.currentUser.set({ ...user });
    }
  }

  incrementTestCount(): void {
    const user = this.currentUser();
    if (!user) return;

    user.testsTaken = (user.testsTaken || 0) + 1;

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex > -1) {
      users[userIndex] = user;
      this.saveUsers(users);
      this.currentUser.set({ ...user });
    }
  }
}
