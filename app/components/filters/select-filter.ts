import { action, get } from '@ember/object';
import FilterComponent from './filter';

export default class SelectFilterComponent extends FilterComponent {
  @action
  async selectChange(m: object) {
    const value = m
      ? (get(m, this.args.searchField) as string | undefined)
      : undefined;
    this.updateQueryParams({
      [this.args.queryParam]: value,
    });
  }
}
