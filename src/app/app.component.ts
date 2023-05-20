import { Component, OnInit } from '@angular/core';
import { constants } from './utils/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  config = constants.FULL_PAGE_JS_CONFIG;
  fullpage_api: any;

  constructor() {}

  ngOnInit() {
  }

  getRef(fullPageRef: any) {
    this.fullpage_api = fullPageRef;
  }

}
