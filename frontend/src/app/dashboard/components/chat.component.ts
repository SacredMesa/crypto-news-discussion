import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ChatService} from '../services/chat.service';
import {ChatMessages} from '../interfaces/chat.interface';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('msgInp') msgInp: ElementRef;

  text = 'Join';
  form: FormGroup;
  name;

  messages: ChatMessages[] = [
    {
      from: 'DegenSpartan',
      message: 'Harrow wat this red button do',
      timestamp: '09:37'
    },
    {
      from: 'bitcoinpanda69',
      message: 'Moon looks out of balance to Chang. Sell now',
      timestamp: '09:35'
    }
  ];

  $event: Subscription;

  constructor(private fb: FormBuilder, private chatSvc: ChatService) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      username: this.fb.control(''),
      message: ['', Validators.required]
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
    this.msgInp.nativeElement.focus();
  }

  toggleConnection(): void {
    if (this.text === 'Join') {
      this.text = 'Leave';
      this.name = this.form.get('username').value;
      this.chatSvc.join(this.name);

      this.$event = this.chatSvc.event.subscribe(
        (chat) => {
          this.messages.push(chat);
          console.log('message being pushed: ', chat, ' All Msgs: ', this.messages);
        }
      );
    } else {
      this.text = 'Join';
      this.name = this.form.get('username').value;
      this.chatSvc.leave(this.name);
      this.$event.unsubscribe();
      this.$event = null;
    }
  }
}
