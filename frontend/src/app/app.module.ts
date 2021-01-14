import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';

import {ChatService} from './dashboard/services/chat.service';

import {Routing} from './app.routing';

import {AppComponent} from './app.component';
import {
  NbThemeModule,
  NbLayoutModule,
  NbSidebarModule,
  NbActionsModule,
  NbMenuModule,
  NbContextMenuModule
} from '@nebular/theme';
import {NbEvaIconsModule} from '@nebular/eva-icons';



const NEBULAR = [
  NbThemeModule.forRoot({name: 'dark'}),
  NbLayoutModule,
  NbEvaIconsModule,
  NbSidebarModule.forRoot(),
  NbActionsModule,
  NbMenuModule.forRoot(),
  NbContextMenuModule
];


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    Routing,
    HttpClientModule,
    NEBULAR
  ],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
