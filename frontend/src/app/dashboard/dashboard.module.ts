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
  NbCardModule
} from '@nebular/theme';

const NEBULAR = [
  NbThemeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbButtonModule,
  NbMenuModule,
  NbIconModule,
  NbCardModule
];

@NgModule({
  declarations: [
    DashComponent,
    CoinComponent
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
