import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AngularFullpageModule } from '@fullpage/angular-fullpage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MbdBootstrapModule } from './mbd-bootstrap/mbd-bootstrap.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FullpageWrapperComponent } from './components/fullpage-wrapper/fullpage-wrapper.component';
import { IntroductionComponent } from './components/introduction/introduction.component';

@NgModule({
  declarations: [
    AppComponent,
    FullpageWrapperComponent,
    IntroductionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFullpageModule,
    MbdBootstrapModule,
    BrowserAnimationsModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
