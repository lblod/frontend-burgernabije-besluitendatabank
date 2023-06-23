import Component from '@glimmer/component';
import { action } from "@ember/object";
import FilterComponent from './filter';
import { tracked } from '@glimmer/tracking';

export default class SearcherDateRangeFilterComponent extends FilterComponent {
  @tracked start?: string;
  @tracked end?: string;


  @action
  searchUpdateFilter() {
      if (this.args.info.filterObject) {
          this.args.searcherUpdateFilter(this.args.info.filterObject([this.start, this.end]));
      }
  }


  @action
  async onLoad() {
      this.init(this);

      [this.start, this.end] = this.getQueryParamsValues()
      
      this.searchUpdateFilter();
  }

  @action
  async dateChange(e: any, start: string, end: string) {
    this.start = start;
    this.end = end;
 
    if (this.queryParams) {
      let queryParams: {[key:string]: string} = {};
      let startParam = this.queryParams[0];
      let endParam = this.queryParams[1];

      if (startParam) {
        queryParams[startParam] = this.start;
      }
      if (endParam) {
        queryParams[endParam] = this.end;
      }

      this.updateQueryParams([this.start, this.end]);
    }

    this.searchUpdateFilter();
  }
}
