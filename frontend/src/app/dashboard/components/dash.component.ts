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
      title: 'Token Name (placeholder)',
      icon: 'people',
      link: '/dashboard/robots'
    },
    {
      title: 'Login',
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
