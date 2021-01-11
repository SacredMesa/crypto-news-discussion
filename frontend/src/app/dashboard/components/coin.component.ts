import {AfterViewInit, Component, OnInit} from '@angular/core';

declare const TradingView: any;

@Component({
  selector: 'app-coin',
  templateUrl: './coin.component.html',
  styleUrls: ['./coin.component.scss']
})

export class CoinComponent implements OnInit, AfterViewInit {

  headlines: string[] = [
    'article 1',
    'article 2',
    'article 3'
  ];

  constructor() {
  }

  ngOnInit(): void {
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
}
