import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent implements OnInit {

  regForm: FormGroup;
  errMsg;

  constructor(
    protected router: Router, private fb: FormBuilder, private authSvc: AuthService) {
  }

  ngOnInit(): void {
    this.regForm = this.fb.group({
      username: this.fb.control('', [Validators.required, Validators.pattern('.+@.+\\..+')]),
      password: this.fb.control('', [Validators.required]),
      nickname: this.fb.control('', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]),
    });
  }

  register(): void {
    console.log('> values: ', this.regForm.value);

    const user = this.regForm.controls.username.value;
    const pass = this.regForm.controls.password.value;
    const nick = this.regForm.controls.nickname.value;

    this.authSvc.register(user, pass, nick)
      .then(result => {
        console.log('>>> result: ', result);
        if (result) {
          this.errMsg = '';
          this.router.navigate(['/auth/regsuccess']);
        } else {
          this.errMsg = 'This email has already been registered! Go sign in';
        }
      });
  }
}
