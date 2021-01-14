import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthComponent} from './components/auth.component';
import {LoginComponent} from './components/login.component';
import {RegisterComponent} from './components/register.component';
import {RegSuccessComponent} from "./components/reg-success.component";

export const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'regsuccess',
        component: RegSuccessComponent,
      }
    ],
  },
  // {path: 'login', component: LoginComponent},
  // {path: 'register', component: RegisterComponent},
  {path: '**', redirectTo: '/', pathMatch: 'full'},
];

export const authenticationRouting: ModuleWithProviders<any> = RouterModule.forChild(routes);
