import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

// Routing
import {dashboardRouting} from './dashboard.routing';

// Components
import {DashComponent} from './components/dash.component';
import {CoinComponent} from './components/coin.component';

// Nebular Modules
import {
  NbThemeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbMenuModule,
  NbIconModule,
  NbCardModule,
  NbListModule
} from '@nebular/theme';
import { ChatComponent } from './components/chat.component';

const NEBULAR = [
  NbThemeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbMenuModule,
  NbIconModule,
  NbCardModule,
  NbListModule
];

@NgModule({
  declarations: [
    DashComponent,
    CoinComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
    dashboardRouting,
    NEBULAR
  ],
  exports: [
    DashComponent,
    CoinComponent
  ]
})

export class DashboardModule {
}
