import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {DashComponent} from './components/dash.component';
import {BitcoinComponent} from './components/coins/bitcoin.component';
import {EthereumComponent} from './components/coins/ethereum.component';
import {SushiswapComponent} from './components/coins/sushiswap.component';

export const routes: Routes = [
  {
    path: '',
    component: DashComponent,
    children: [
      {
        path: 'bitcoin',
        component: BitcoinComponent
      },
      {
        path: 'ethereum',
        component: EthereumComponent
      },
      {
        path: 'sushi',
        component: SushiswapComponent
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/', pathMatch: 'full'
  }
];

export const dashboardRouting: ModuleWithProviders<any> = RouterModule.forChild(routes);
