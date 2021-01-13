import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ChatService} from '../services/chat.service';
import {ChatMessages} from '../interfaces/chat.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  text = 'Join';
  form: FormGroup;

  messages: ChatMessages[] = [{
    from: 'test',
    message: 'testest',
    timestamp: 'anytime'
  }];

  $event: Subscription;

  constructor(private fb: FormBuilder, private chatSvc: ChatService) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: this.fb.control(''),
      message: this.fb.control('')
    });
  }

  ngOnDestroy(): void {
    if (null != this.$event) {
      this.$event.unsubscribe();
      this.$event = null;
    }
  }

  sendMessage(): any {
    const message = this.form.get('message').value;
    this.form.get('message').reset();
    console.log('>>> message: ', message);
    this.chatSvc.sendMessage(message);
  }

  toggleConnection(): void {
    if (this.text === 'Join') {
      this.text = 'Leave';
      const name = this.form.get('username').value;
      this.chatSvc.join(name);

      this.$event = this.chatSvc.event.subscribe(
        (chat) => {
          this.messages.unshift(chat);
          console.log('message being pushed: ', chat, ' All Msgs: ', this.messages);
        }
      );
    } else {
      this.text = 'Join';
      const name = this.form.get('username').value;
      this.chatSvc.leave(name);
      this.$event.unsubscribe();
      this.$event = null;
    }
  }
}
