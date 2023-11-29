import { action } from '@ember/object';
import FilterComponent, { type FilterArgs } from './filter';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  deserializeArray,
  serializeArray,
} from 'frontend-lokaalbeslist/utils/query-params';

type Option = Record<string, string>;

interface Signature {
  Args: {
    options: Promise<Option[]>;
  } & FilterArgs;
}

export default class SelectMultipleFilterComponent extends FilterComponent<Signature> {
  @tracked selected?: Option[];

  /** Action to parse the queryParameter value(s) & select them in the select input */
  @action
  async inserted() {
    // The queryParam is an array of searchField values, joined by seperator
    // On the page load, we can use this to load in values
    const queryParam = this.getQueryParam(this.args.queryParam);
    if (queryParam) {
      const needles = deserializeArray(queryParam);
      const searchField = this.args.searchField;

      const haystack = await this.args.options;
      const results: Option[] = [];

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
  async selectChange(selectedOptions: Option[]) {
    this.selected = selectedOptions;

    this.updateQueryParams({
      [this.args.queryParam]: serializeArray(
        selectedOptions
          .map((value) => value[this.args.searchField])
          .filter(Boolean) as string[]
      ),
    });
  }
}
