import { Component } from '@angular/core';
import { constants } from 'src/app/utils/constants';

@Component({
  selector: 'app-fullpage-wrapper',
  templateUrl: './fullpage-wrapper.component.html',
  styleUrls: ['./fullpage-wrapper.component.scss']
})
export class FullpageWrapperComponent {
  config = constants.FULL_PAGE_JS_CONFIG;
  fullpage_api: any;

  constructor() {}

  ngOnInit() {
  }

  getRef(fullPageRef: any) {
    this.fullpage_api = fullPageRef;
  }
}
