import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {Subject} from 'rxjs';
import {ChatMessages} from '../interfaces/chat.interface';

@Injectable()
export class ChatService {

  currentCoin;
  nickname;

  private sock: WebSocket = null;
  event = new Subject<ChatMessages>();

  setRoom(coin): void {
    this.currentCoin = coin;
  }

  sendMessage(msg): any {
    this.sock.send(msg);
  }

  join(name: string): void {
    const params = new HttpParams().set('name', name);
    const url = `ws://localhost:3000/chat/${this.currentCoin}?${params.toString()}`;
    console.log('ws url: ', url);
    this.sock = new WebSocket(url);

    this.sock.onmessage = (payload: MessageEvent) => {
      const chat = JSON.parse(payload.data) as ChatMessages;
      this.event.next(chat);
    };

    this.sock.onclose = () => {
      if (this.sock != null) {
        console.log('OH NO IT IS CLOSING');
        this.sock.close();
        this.sock = null;
      }
    };
  }

  leave(name): any {
    if (this.sock != null) {
      this.sock.close();
      this.sock = null;
      console.log(`${name} is leaving`);
    }
  }
}
