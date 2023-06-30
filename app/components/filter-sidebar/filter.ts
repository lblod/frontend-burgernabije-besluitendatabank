import Component from '@glimmer/component';
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";

interface ArgsInterface {
    id: string;
    queryParam: string;
    queryParamsA: string;
    queryParamsB: string;

    searchField: string;
    options: any;
}

export default class FilterComponent extends Component<ArgsInterface> {
    @service declare router: RouterService;

    getQueryParam(param: string) {
        return get(this.router.currentRoute.queryParams, param);
    }

    updateQueryParams(params: object) {
        this.router.transitionTo(this.router.currentRouteName, {
            queryParams: params,
        });
    }
}
