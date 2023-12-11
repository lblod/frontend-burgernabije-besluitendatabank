import { action, get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  deserializeArray,
  serializeArray,
} from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import FilterComponent, { type FilterArgs } from './filter';

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
    const haystack = await this.args.options;
    const searchField = this.args.searchField;
    let queryParam = null;
    let needles = null;

    if (haystack[0]!['groupName']) {
      const groupNames = haystack.map((group) => group['groupName']);
      queryParam = groupNames;
      console.log(queryParam);
      needles = queryParam.map((qp) => this.getQueryParam(qp!));
      console.log(needles);
    } else {
      queryParam = this.getQueryParam(this.args.queryParam);
      needles = deserializeArray(queryParam as string);
    }

    if (queryParam) {
      const flattenedHaystack: Option[] = [];
      if (haystack[0]!['groupName']) {
        haystack.forEach((group: any) => {
          group['options'].forEach((option: Option) => {
            flattenedHaystack.push(option);
          });
        });
        haystack.push(...flattenedHaystack);
      }

      const results: any[] = [];

      for (let i = 0; i < needles.length; i++) {
        const needle = needles[i];
        const found = haystack.filter(
          (value) => get(value, searchField) === needle
        );
        if (found) {
          results.push(found);
        }
      }

      console.log(results);
      this.selected = results;
    }
  }

  @action
  async selectChange(selectedOptions: Option[]) {
    this.selected = selectedOptions;

    this.updateQueryParams({
      ['provincies']: serializeArray(
        selectedOptions
          .map((value) => {
            if (value['type'] === 'Province') {
              return value[this.args.searchField];
            }
          })
          .filter(Boolean) as string[]
      ),
    });

    this.updateQueryParams({
      [this.args.queryParam]: serializeArray(
        selectedOptions
          .map((value) => {
            if (value['type'] !== 'Province') {
              return value[this.args.searchField];
            }
          })
          .filter(Boolean) as string[]
      ),
    });
  }
}
