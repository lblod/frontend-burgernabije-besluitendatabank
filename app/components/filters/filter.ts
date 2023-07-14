import Component from '@glimmer/component';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { get } from '@ember/object';

interface Signature {
  Args: {
    id: string;
    queryParam: string;
    queryParamsA: string;
    queryParamsB: string;

    searchField: string;
    options: Array<object>;

    valueA?: string;
    valueB?: string;
  };
}

export default class FilterComponent<S = Signature> extends Component<S> {
  @service declare router: RouterService;

  /**
   *
   * @param param name of the queryParameter that is presented to the user
   * @returns queryParameter value. Possibly undefined
   */
  getQueryParam(param: string) {
    return get(this.router.currentRoute.queryParams, param);
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
