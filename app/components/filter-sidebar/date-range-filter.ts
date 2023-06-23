import Component from '@glimmer/component';
import { action } from "@ember/object";
import { tracked } from '@glimmer/tracking';
import FilterComponent from './filter';

export default class SearcherDateRangeFilterComponent extends FilterComponent {



  @action
  async dateChange(e: any, start: string, end: string) {
    console.log(start)
    console.log(end)
    console.log(this.args)
    console.log({
      [this.args.queryParamsA]: start,
      [this.args.queryParamsB]: end
    })
    this.updateQueryParams({
      [this.args.queryParamsA]: start,
      [this.args.queryParamsB]: end
    });
  }
}
