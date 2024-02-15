import { action, get } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
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
  @service declare router: RouterService;

  get selected() {
    return this.args.selected;
  }

  @action
  onSelectedChange(newOptions: Option[]) {
    this.args.updateSelected(newOptions);
  }

  @action
  async inserted() {
    const searchField = this.args.searchField;

    if (!this.router.currentRoute) {
      console.error('Current route is not available');
      return;
    }

    const flattenedHaystack: Option[] = [];
    const haystack = await this.args.options;

    if (this.isGroupedOptions(haystack)) {
      haystack.forEach((group: GroupedOptions) => {
        if (group.options) {
          group.options.forEach((option: Option) => {
            flattenedHaystack.push(option);
          });
        }
      });
    } else if (Array.isArray(haystack)) {
      haystack.forEach((option: Option) => {
        flattenedHaystack.push(option);
      });
    } else {
      console.error('Unexpected format for options:', haystack);
      return;
    }

    const results = deserializeArray(this.args.queryParam).flatMap(
      (queryParam: string | null) => {
        if (!queryParam) return [];
        const queryParamValue = this.getQueryParam(queryParam);
        const values = queryParamValue ? deserializeArray(queryParamValue) : [];
        return values
          .flatMap((value) => value.split(','))
          .map((value) => {
            return flattenedHaystack.find(
              (option) =>
                get(option, searchField) === value &&
                (option['type'] ? option['type'] === queryParam : true)
            );
          })
          .filter(Boolean) as Option[];
      }
    );

    this.onSelectedChange(results);
  }

  isGroupedOptions(options: unknown): options is GroupedOptions[] {
    return (
      Array.isArray(options) && options.length > 0 && 'groupName' in options[0]
    );
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
