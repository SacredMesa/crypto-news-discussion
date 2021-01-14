import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class AuthService {

  private token = '';

  constructor(private http: HttpClient) {
  }

  login(username, password): Promise<boolean> {

    this.token = '';
    return this.http.post<any>('http://localhost:3000/login',
      {username, password}, {observe: 'response'}
    ).toPromise()
      .then(resp => {
        if (resp.status === 200) {
          this.token = resp.body.token;
        }
        console.log('resp: ', resp);
        return true;
      })
      .catch(err => {
        if (err.status === 401) {
          console.log('ERROR LOGGING IN')
        }
        console.log('err:', err);
        return false;
      });
  }

}
