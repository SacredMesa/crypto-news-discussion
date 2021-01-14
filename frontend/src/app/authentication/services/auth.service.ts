import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AuthService {

  server = `https://octobus.herokuapp.com`;

  constructor(private http: HttpClient) {
  }

  login(username, password): Promise<boolean> {
    return this.http.post<any>(`${this.server}/login`,
      {username, password}, {observe: 'response'})
      .toPromise()
      .then(res => {
        if (res.status === 200) {
          sessionStorage.setItem('nickname', res.body.nickname);
          sessionStorage.setItem('token', res.body.token);
        }
        console.log('res: ', res);
        return true;
      })
      .catch(err => {
        if (err.status === 401) {
          console.log('ERROR LOGGING IN');
        }
        console.log('err:', err);
        return false;
      });
  }

  register(username, password, nickname): Promise<boolean> {
    return this.http.post<any>(`${this.server}/register`,
      {username, password, nickname}, {observe: 'response'})
      .toPromise()
      .then(res => {
        console.log('res', res);
        return true;
      })
      .catch(err => {
        return false;
      });
  }

  checkAuth(token): Promise<boolean> {
    return this.http.post<any>(`${this.server}/verify`,
      {token}, {observe: 'response'})
      .toPromise()
      .then(res => {
        console.log('res', res);
        return true;
      })
      .catch(err => {
        console.log('err', err);
        return false;
      });

  }

}
