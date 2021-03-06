import {Component} from '@angular/core';

// Nebular
import {NbSidebarService} from '@nebular/theme';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})

export class DashComponent {
  sideNavMenu = [
    {
      title: 'Bitcoin',
      icon: 'heart',
      link: '/dashboard/bitcoin'
    },
    {
      title: 'Ethereum',
      icon: 'heart',
      link: '/dashboard/ethereum'
    },
    {
      title: 'Sushi',
      icon: 'heart',
      link: '/dashboard/sushi'
    },
    {
      title: 'Account',
      icon: 'lock',
      link: '/auth'
    }
  ];

  constructor(private sidebarService: NbSidebarService) {
  }

  toggle(): boolean {
    this.sidebarService.toggle(true, 'leftMenu');
    return false;
  }
}
