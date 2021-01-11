import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AuthComponent} from './components/auth.component';
import {LoginComponent} from './components/login.component';
import {RegisterComponent} from './components/register.component';

import {
  NbAuthComponent,
  NbLoginComponent,
  NbRegisterComponent,
  NbLogoutComponent,
  NbRequestPasswordComponent,
  NbResetPasswordComponent,
} from '@nebular/auth';

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
        component: NbRegisterComponent,
      },
      {
        path: 'logout',
        component: NbLogoutComponent,
      },
      {
        path: 'request-password',
        component: NbRequestPasswordComponent,
      },
      {
        path: 'reset-password',
        component: NbResetPasswordComponent,
      },
    ],
  },
  // {path: 'login', component: LoginComponent},
  // {path: 'register', component: RegisterComponent},
  {path: '**', redirectTo: '/', pathMatch: 'full'},
];

export const authenticationRouting: ModuleWithProviders<any> = RouterModule.forChild(routes);
