import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

// Routing
import {authenticationRouting} from './authentication.routing';

// Components
import {LoginComponent} from './components/login.component';
import {RegisterComponent} from './components/register.component';

// Nebular
import {NbPasswordAuthStrategy, NbAuthModule} from '@nebular/auth';

const NEBULAR = [
  NbAuthModule.forRoot({
    strategies: [
      NbPasswordAuthStrategy.setup({
        name: 'email',
        baseEndpoint: 'ENDPOINT IN HERE',
        login: {
          endpoint: '/auth/sign-in',
          method: 'post',
        },
        register: {
          endpoint: '/auth/sign-up',
          method: 'post',
        },
        logout: {
          endpoint: '/auth/sign-out',
          method: 'post',
        },
        resetPass: {
          endpoint: '/auth/reset-pass',
          method: 'post',
        }
      })
    ],
    forms: {},
  }),
];

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    authenticationRouting,
    NEBULAR
  ],
  exports: [
    LoginComponent,
    RegisterComponent
  ]
})

export class AuthenticationModule {
}
