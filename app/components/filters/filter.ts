import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export interface FilterArgs {
  id: string;
  queryParam: string;

  searchField: string;
  options: Array<object>;
}

interface Signature {
  Args: FilterArgs;
}

export default class FilterComponent<S = Signature> extends Component<S> {
  @service declare router: RouterService;

  /**
   *
   * @param param name of the queryParameter that is presented to the user
   * @returns queryParameter value. Possibly undefined
   */
  getQueryParam(param: string): string | undefined {
    // param can be gemeentes,provincies
    // if the queryParam is delimited by a comma, we want to split it and map through this.router.currentRoute.queryParams
    if (param.includes(',')) {
      const params = param.split(',');
      const queryParams = this.router.currentRoute.queryParams;
      const values: string[] = [];

      console.log(params);

      params.map((param) => {
        if (queryParams[param]) {
          values.push(queryParams[param] as string);
        }
      });
      console.log(values);
      return values.join(',');
    }
    return this.router.currentRoute.queryParams[param];

    // return this.router.currentRoute.queryParams[param];
  }

  /**
   *
   * @param params object with {queryParameterName: newValue}
   */
  updateQueryParams(params: { [key: string]: unknown }) {
    this.router.transitionTo(this.router.currentRouteName, {
      queryParams: params,
    });
  }
}
