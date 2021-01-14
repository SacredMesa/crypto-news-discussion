import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';

import {ChatService} from '../services/chat.service';
import {AuthService} from '../../authentication/services/auth.service';

import {ChatMessages} from '../interfaces/chat.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('msgInp') msgInp: ElementRef;

  text = 'Join Chat';
  form: FormGroup;
  name;
  private token;
  isVerified;

  messages: ChatMessages[] = [];

  $event: Subscription;

  constructor(private fb: FormBuilder, private chatSvc: ChatService, private authSvc: AuthService) {
  }

  async ngOnInit(): Promise<void> {

    this.form = this.fb.group({
      message: ['', Validators.required]
    });

    this.messages = await this.chatSvc.getMessagesFromDB();

    this.token = sessionStorage.getItem('token');
    this.isVerified = await this.authSvc.checkAuth(this.token);

    if (this.isVerified && sessionStorage.getItem('nickname') !== undefined) {
      this.name = sessionStorage.getItem('nickname');
      this.chatSvc.join(this.name);

      this.$event = this.chatSvc.event.subscribe(
        (chat) => {
          this.messages.push(chat);
          console.log('message being pushed: ', chat, ' All Msgs: ', this.messages);
        }
      );
    } else {
      sessionStorage.clear();
    }
  }

  ngOnDestroy(): void {
    if (null != this.$event) {
      this.chatSvc.leave(this.name);
      this.$event.unsubscribe();
      this.$event = null;
    }
  }

  sendMessage(): any {
    const message = this.form.get('message').value;
    this.form.get('message').reset();
    console.log('>>> message: ', message);
    this.chatSvc.sendMessage(message);
    this.msgInp.nativeElement.focus();
  }
}

