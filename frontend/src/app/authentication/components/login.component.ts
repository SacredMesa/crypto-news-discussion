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

  constructor(
    protected router: Router, private fb: FormBuilder, private authSvc: AuthService) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required]),
    });
  }

  login(): void {
    console.log('> values: ', this.loginForm.value);

    const user = this.loginForm.controls.username.value;
    const pass = this.loginForm.controls.password.value;

    this.authSvc.login(user, pass)
      .then(result => {
        console.log('>>> result: ', result);
        this.router.navigate(['/dashboard/bitcoin']);
      });
  }
}
