import { action } from "@ember/object";
import FilterComponent from './filter';

export default class SearcherDateRangeFilterComponent extends FilterComponent {

  @action
  resetDate() {
    this.updateQueryParams({
      [this.args.queryParamsA]: undefined,
      [this.args.queryParamsB]: undefined
    });
  }

  @action
  async dateChange(e: any, start: string, end: string) {
    this.updateQueryParams({
      [this.args.queryParamsA]: start,
      [this.args.queryParamsB]: end
    });
  }
}
