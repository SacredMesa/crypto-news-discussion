import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

// Routing
import {authenticationRouting} from './authentication.routing';

// Components
import {AuthBlockComponent} from './components/auth-block.component';
import {AuthComponent} from './components/auth.component';
import {LoginComponent} from './components/login.component';
import {RegisterComponent} from './components/register.component';
import {AuthService} from './services/auth.service';

// Nebular
import {
  NbButtonModule, NbCardModule,
  NbIconModule, NbInputModule,
  NbLayoutModule,
  NbMenuModule,
  NbSidebarModule,
  NbThemeModule
} from '@nebular/theme';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

const NEBULAR = [
  NbThemeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbMenuModule,
  NbIconModule,
  NbCardModule,
  NbInputModule
];

@NgModule({
  declarations: [
    AuthBlockComponent,
    AuthComponent,
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    authenticationRouting,
    NEBULAR
  ],
  exports: [
    AuthComponent,
    LoginComponent,
    RegisterComponent
  ],
  providers: [
    AuthService
  ]
})

export class AuthenticationModule {
}
