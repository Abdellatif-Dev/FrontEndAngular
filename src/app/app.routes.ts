import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { Register } from './pages/auth/register/register';
import { LoginComponent } from './pages/auth/login/login';
import { DashboardAdmin } from './pages/dashboard-admin/dashboard-admin';
import { ProduitComponent } from './components/produit/produit';
import { ProfilComponent } from './components/profil/profil';
import { DashAdmin } from './components/dash-admin/dash-admin';
import { AuthRoleGuard } from './services/authGuard';
import {  CheckoutComponent } from './pages/checkout/checkout';
import { DashUser } from './components/dash-user/dash-user';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: Register },
  {
    path: 'admin',
    component: DashboardAdmin,
    canActivate: [AuthRoleGuard],
    data: { role: 'ROLE_ADMIN' },
    children: [
      { path: 'dashboard', component: DashAdmin },
      { path: 'produits', component: ProduitComponent },
      { path: 'profil', component: ProfilComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'user',
    component: DashboardAdmin,
    canActivate: [AuthRoleGuard],
    data: { role: 'ROLE_USER' },
    children: [
      { path: 'dashboard', component: DashUser },
      { path: 'profil', component: ProfilComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'login', component: LoginComponent },


];
