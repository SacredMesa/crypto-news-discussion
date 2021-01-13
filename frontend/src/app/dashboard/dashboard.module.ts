import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

// Routing
import {dashboardRouting} from './dashboard.routing';

// Components and Services
import {DashComponent} from './components/dash.component';
import {ChatComponent} from './components/chat.component';
import {BitcoinComponent} from './components/coins/bitcoin.component';
import {EthereumComponent} from './components/coins/ethereum.component';
import {SushiswapComponent} from './components/coins/sushiswap.component';

import {NewsService} from './services/news.service';

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
    ChatComponent,
    BitcoinComponent,
    EthereumComponent,
    SushiswapComponent
  ],
  imports: [
    CommonModule,
    dashboardRouting,
    NEBULAR
  ],
  exports: [
    DashComponent,
    BitcoinComponent
  ],
  providers: [
    NewsService
  ]
})

export class DashboardModule {
}
