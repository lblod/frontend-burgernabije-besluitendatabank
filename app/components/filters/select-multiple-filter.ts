import { action } from '@ember/object';
import FilterComponent from './filter';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { seperator } from 'frontend-burgernabije-besluitendatabank/helpers/constants';

const regex = new RegExp('\\' + seperator + '$', 'm');

export default class SelectMultipleFilterComponent extends FilterComponent {
  @tracked selected?: object;

  @action
  async inserted() {
    // The queryParam is an array of searchField values, joined by seperator
    // On the page load, we can use this to load in values
    const queryParam = this.getQueryParam(this.args.queryParam);
    if (queryParam) {
      const needles = queryParam.split(seperator);
      const searchField = this.args.searchField;

      const haystack: Array<object> = await this.args.options;
      const results: Array<object> = [];

      for (let i = 0; i < needles.length; i++) {
        const needle = needles[i];
        const found = haystack.find(
          (value) => get(value, searchField) === needle
        );
        if (found) {
          results.push(found);
        }
      }

      this.selected = results;
    }
  }

  @action
  async selectChange(m: []) {
    // Update UI
    this.selected = m;

    // Update queryParameters
    let values = '';
    for (let i = 0; i < m.length; i++) {
      values += get(m[i], this.args.searchField) + seperator;
    }
    values = values.replace(regex, '');

    this.updateQueryParams({
      [this.args.queryParam]: values,
    });
  }
}
