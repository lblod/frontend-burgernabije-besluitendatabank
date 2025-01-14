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

type UnifiedOptions = Option | GroupedOptions;

interface Signature {
  Args: {
    options: Promise<UnifiedOptions[]>;
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
    if (!this.router.currentRoute) {
      console.error('Current route is not available');
      return;
    }

    const searchField = this.args.searchField;
    const haystack = await this.args.options;
    const flattenedHaystack = haystack.reduce((acc, value) => {
      if (Array.isArray(value.options)) {
        return [...acc, ...value.options];
      } else {
        return [...acc, value as Option];
      }
    }, [] as Option[]);

    const results = deserializeArray(this.args.queryParam).flatMap(
      (queryParam) => {
        if (!queryParam) return [];
        const queryParamValue = this.getQueryParam(queryParam);
        const values = queryParamValue ? deserializeArray(queryParamValue) : [];

        return values
          .map((value) => {
            return flattenedHaystack.find(
              (option) =>
                get(option, searchField) === value &&
                option['type'] === queryParam,
            );
          })
          .filter(Boolean) as Option[];
      },
    );

    this.onSelectedChange(results);
  }

  @action
  async selectChange(selectedOptions: Option[]) {
    this.onSelectedChange(selectedOptions);

    const emptyQueryParams: Record<string, string | undefined> =
      deserializeArray(this.args.queryParam).reduce((acc, value) => {
        return {
          ...acc,
          [value]: undefined,
        };
      }, {});

    const queryParams = selectedOptions.reduce((acc, { label, type }) => {
      return {
        ...acc,
        ...(type && { [type]: acc[type] ? `${acc[type]}+${label}` : label }),
      };
    }, emptyQueryParams);

    this.updateQueryParams(queryParams);
  }
}
