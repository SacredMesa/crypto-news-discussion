import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';

import {NewsService} from '../../services/news.service';
import {HeadlinesResults} from '../../interfaces/headlines-results.interface';

import {interval, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

declare const TradingView: any;

@Component({
  selector: 'app-coin',
  templateUrl: './bitcoin.component.html',
  styleUrls: ['./coin.component.scss']
})

export class BitcoinComponent implements OnInit, AfterViewInit, OnDestroy {

  coin = 'bitcoin';
  headlinesResults: HeadlinesResults[] = [];

  private onDestroy$ = new Subject<void>();

  constructor(private newsSvc: NewsService) {
  }

  async ngOnInit(): Promise<any> {
    this.headlinesResults = await this.newsSvc.getHeadlinesFromDB(this.coin);
    console.log('Inited headlines');

    interval(10000)
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(async x => {
        this.headlinesResults = await this.newsSvc.getHeadlinesFromDB(this.coin);
        console.log('Refresh has happened');
      });
  }

  ngAfterViewInit(): any {
    // tslint:disable-next-line:no-unused-expression
    new TradingView.widget(
      {
        autosize: true,
        symbol: 'COINBASE:BTCUSD',
        interval: '60',
        timezone: 'Etc/UTC',
        theme: 'Dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        range: 'ytd',
        hide_side_toolbar: true,
        hide_top_toolbar: true,
        show_popup_button: true,
        withdateranges: false,
        popup_width: '1000',
        popup_height: '650',
        no_referral_id: true,
        container_id: 'tradingview_bac65'
      }
    );
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    console.log('destroying');
  }
}
