import { Component, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';

import { AuthService } from '../services/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnDestroy {

  private destroy$ = new Subject<void>();

  constructor(protected auth: AuthService, protected location: Location) {
  }

  back(): boolean {
    this.location.back();
    return false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
