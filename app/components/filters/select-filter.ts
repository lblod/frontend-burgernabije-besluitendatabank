import { action } from '@ember/object';
import FilterComponent from './filter';
import { get } from '@ember/object';

export default class SelectFilterComponent extends FilterComponent {
  @action
  async selectChange(m: any) {
    const value = m ? get(m, this.args.searchField) : null;
    this.updateQueryParams({
      [this.args.queryParam]: value,
    });
  }
}
