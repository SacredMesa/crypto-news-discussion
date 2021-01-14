import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-reg-success',
  templateUrl: './reg-success.component.html',
  styleUrls: ['./reg-success.component.scss']
})
export class RegSuccessComponent {

  constructor(protected router: Router) {
  }

  backToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
