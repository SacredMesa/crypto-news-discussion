import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  }

];

export const Routing: ModuleWithProviders<any> = RouterModule.forRoot(routes);
