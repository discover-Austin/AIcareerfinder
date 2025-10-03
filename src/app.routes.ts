import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'AI Career Path Finder' },
  { path: 'about', component: AboutComponent, title: 'About | AI Career Path Finder' },
  { path: 'login', component: LoginComponent, title: 'Login | AI Career Path Finder' },
  { 
    path: 'profile', 
    component: ProfileComponent, 
    title: 'My Profile | AI Career Path Finder',
    canActivate: [authGuard]
  }
];
