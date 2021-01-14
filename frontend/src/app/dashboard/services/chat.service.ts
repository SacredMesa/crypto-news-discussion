import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Subject} from 'rxjs';
import {ChatMessages} from '../interfaces/chat.interface';

@Injectable()
export class ChatService {

  server = `ws://octobus.herokuapp.com`;

  currentCoin;
  nickname;

  private sock: WebSocket = null;
  event = new Subject<ChatMessages>();

  constructor(private http: HttpClient) {
  }

  setRoom(coin): void {
    this.currentCoin = coin;
  }

  sendMessage(msg): any {
    this.sock.send(msg);
  }

  join(name: string): void {
    const params = new HttpParams().set('name', name);
    const url = `${this.server}/chat/${this.currentCoin}?${params.toString()}`;
    // const url = `ws://localhost:3000/chat/${this.currentCoin}?${params.toString()}`;
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

  async getMessagesFromDB(): Promise<ChatMessages[]> {

    let messages: ChatMessages[] = [];

    const url = `https://octobus.herokuapp.com`;

    await this.http
      .get<any>(`${url}/messages/pull/${this.currentCoin}`)
      // .get<any>(`http://localhost:3000/messages/pull/${this.currentCoin}`)
      .toPromise()
      .then(res => {
        messages = res;
        console.log(messages);
      });

    return messages;
  }
}
