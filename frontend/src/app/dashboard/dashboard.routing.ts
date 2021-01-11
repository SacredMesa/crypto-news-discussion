import {ModuleWithProviders} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {DashComponent} from './components/dash.component';
import {CoinComponent} from './components/coin.component';

export const routes: Routes = [
  {
    path: '',
    component: DashComponent,
    children: [
      {
        path: 'robots',
        component: CoinComponent
      },
    ]
  },
  {
    path: '**',
    redirectTo: '/', pathMatch: 'full'
  }
];

export const dashboardRouting: ModuleWithProviders<any> = RouterModule.forChild(routes);
