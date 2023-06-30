import Component from '@glimmer/component';
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";

interface ArgsInterface {
    id: string;
    queryParam: string;
    queryParamsA: string;
    queryParamsB: string;
    searchField: string;
}

export default class FilterComponent extends Component<ArgsInterface> {
    @service declare router: RouterService;

    updateQueryParams(params: object) {
        this.router.transitionTo(this.router.currentRouteName, {
            queryParams: params,
        });
    }
}
