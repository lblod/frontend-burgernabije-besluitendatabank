import { action } from '@ember/object';
import FilterComponent from './filter';
import { tracked } from "@glimmer/tracking";

export default class SearcherDateRangeFilterComponent extends FilterComponent {
  @tracked start: string|undefined = this.args.valueA ? this.args.valueA : undefined;
  @tracked end: string|undefined = this.args.valueB ? this.args.valueB : undefined;


  changeValue(start?: string, end?: string) {
    this.start = start;
    this.end = end;
    this.updateQueryParams({
      [this.args.queryParamsA]: this.start,
      [this.args.queryParamsB]: this.end
    });
  }

  @action
  resetDate() { 
    this.changeValue(undefined, undefined);
  }

  @action
  hideDate() {
    /**
     * There was a weird interaction with a weirder solution
     * 
     * If you...
     * - Selected a daterange
     * - Applied
     * - Opened & resetted
     * - Applied
     * - Opened
     * - And then hide it (don't select anything)
     * 
     * It would display & apply the value you've used before resetting
     * 
     * This was because the hideAction was the same as the applyAction
     * Not defining the hideAction makes au-date-range-picker throw an error
     * 
     * So instead, an empty hideAction?
     * This kinda fixed it:
     * - Now the old value would no longer be applied
     * - But, the old value was still displayed
     * 
     * So how do we fix it?
     * See the silly solution below
     */
    this.start = this.start;
    this.end = this.end;
  }

  @action
  async dateChange(e: any, start: string, end: string) {
    this.changeValue(start, end);
  }
}
