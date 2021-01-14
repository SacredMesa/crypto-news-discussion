import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  errMsg;
  private token;
  isVerified;

  constructor(
    protected router: Router, private fb: FormBuilder, private authSvc: AuthService) {
  }

  async ngOnInit(): Promise<void> {
    this.loginForm = this.fb.group({
      username: this.fb.control('', [Validators.required, Validators.pattern('.+@.+\\..+')]),
      password: this.fb.control('', [Validators.required]),
    });

    this.token = sessionStorage.getItem('token');
    this.isVerified = await this.authSvc.checkAuth(this.token);
    console.log('Verification Status: ', this.isVerified);
  }

  login(): void {
    console.log('> values: ', this.loginForm.value);

    const user = this.loginForm.controls.username.value;
    const pass = this.loginForm.controls.password.value;

    this.authSvc.login(user, pass)
      .then(result => {
        console.log('>>> result: ', result);
        if (result) {
          this.errMsg = '';
          this.router.navigate(['/dashboard/bitcoin']);
        } else {
          this.errMsg = 'Email or password is incorrect. Please try again';
        }
      });
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/dashboard/bitcoin']);
  }
}
