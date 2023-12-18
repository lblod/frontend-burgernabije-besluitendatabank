import { action, get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import FilterComponent, { type FilterArgs } from './filter';

type Option = Record<string, string>;

type GroupedOptions = {
  groupName: string;
  options: Option[];
};

interface Signature {
  Args: {
    route?: string;
    options: Promise<Option[]>;
  } & FilterArgs;
}

export default class SelectMultipleFilterComponent extends FilterComponent<Signature> {
  @tracked selected?: Option[];

  @action
  async inserted() {
    if (this.args.queryParam?.includes(',')) {
      // forEach queryParam delimited by a , split it and do getQueryParam for each
      const needles = this.args.queryParam.split(/[+,]/).map((queryParam) => {
        return this.getQueryParam(queryParam);
      });

      const searchField = this.args.searchField;

      const haystack = (await this.args.options) as unknown as GroupedOptions[];
      const results: Option[] = [];

      const flattenedHaystack: Option[] = [];
      if (haystack[0]?.['groupName']) {
        haystack.forEach((group) => {
          group['options'].forEach((option: Option) => {
            flattenedHaystack.push(option);
          });
        });
      }

      for (let i = 0; i < needles.length; i++) {
        const needle = needles[i];
        const found = flattenedHaystack.find(
          (value) => get(value, searchField) === needle
        );
        if (found) {
          results.push(found);
        }
      }

      this.selected = results;
    } else {
      const queryParam = this.getQueryParam(this.args.queryParam) as string;

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
    // Remove deselected options from queryParam
    this.selected
      ?.filter((value) => !selectedOptions.includes(value))
      .forEach((value) => {
        this.updateQueryParams({
          [value['type'] as string]: undefined,
        });
      });

    this.selected = selectedOptions;

    if (this.args.queryParam.includes(',')) {
      const queryParams = selectedOptions.reduce((acc, { label, type }) => {
        return {
          ...acc,
          ...(type && { [type]: acc[type] ? `${acc[type]}+${label}` : label }),
        };
      }, {} as Record<string, unknown>);

      this.updateQueryParams(queryParams);
    } else {
      this.updateQueryParams({
        [this.args.queryParam]: selectedOptions.map((value) =>
          get(value, this.args.searchField)
        ),
      });
    }
  }
}
