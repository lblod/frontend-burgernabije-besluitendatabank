import { action, get } from '@ember/object';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import FilterComponent, { type FilterArgs } from './filter';

type Option = Record<string, string>;

type GroupedOptions = {
  groupName: string;
  options: Option[];
};

interface Signature {
  Args: {
    options: Promise<Option[]>;
    selected: Option[];
    updateSelected: (selected: Option[]) => void;
  } & FilterArgs;
}

export default class SelectMultipleFilterComponent extends FilterComponent<Signature> {
  get selected() {
    return this.args.selected;
  }

  @action
  onSelectedChange(newOptions: Option[]) {
    this.args.updateSelected(newOptions);
  }

  @action
  async inserted() {
    if (this.args.queryParam?.includes('+')) {
      const needles = deserializeArray(this.args.queryParam).map(
        (queryParam) => {
          if (!queryParam) return [];
          return this.getQueryParam(queryParam);
        }
      );

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

      needles.forEach((needle) => {
        const found = flattenedHaystack.find(
          (value) => get(value, searchField) === needle
        );
        if (found) {
          results.push(found);
        }
      });

      this.onSelectedChange(results);
    } else {
      const queryParam = this.getQueryParam(this.args.queryParam) as string;
      if (!queryParam) return [];

      const needles = deserializeArray(queryParam);
      const searchField = this.args.searchField;

      const haystack = await this.args.options;
      const results: Option[] = [];

      needles.forEach((needle) => {
        const found = haystack.find(
          (value) => get(value, searchField) === needle
        );
        if (found) {
          results.push(found);
        }
      });

      this.onSelectedChange(results);
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

    this.onSelectedChange(selectedOptions);

    if (this.args.queryParam.includes('+')) {
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
