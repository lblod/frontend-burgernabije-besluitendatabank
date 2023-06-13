import Component from '@glimmer/component';
import { action } from "@ember/object";

export default class SearcherDateRangeFilterComponent extends Component {


  @action
  async dateChange(filter: any, e: any, start: string, end: string) {
    filter.start = start;
    filter.end = end;

    if (filter.queryParams) {
      let queryParams: {[key:string]: string} = {};
      let startParam = filter.queryParams[0];
      let endParam = filter.queryParams[1];

      if (startParam) {
        queryParams[startParam] = filter.start;
      }
      if (endParam) {
        queryParams[endParam] = filter.end;
      }

      /*
      this.router.transitionTo(this.router.currentRouteName, {
        queryParams: queryParams
      });
      */
    }

    //this.request();
  }
}
