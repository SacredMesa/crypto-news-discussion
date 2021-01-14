import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {HeadlinesResults} from '../interfaces/headlines-results.interface';

@Injectable()
export class NewsService {

  constructor(private http: HttpClient) {
  }

  async getHeadlinesFromDB(coin): Promise<HeadlinesResults[]> {

    let headlinesResults: HeadlinesResults[] = [];

    const server = `https://octobus.herokuapp.com`;

    await this.http
      .get<any>(`${server}/headlines/${coin}`)
      .toPromise()
      .then(res => {
        headlinesResults = res;
        console.log(headlinesResults);
      });

    return headlinesResults;
  }

}
