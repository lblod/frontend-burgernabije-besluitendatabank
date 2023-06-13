import Component from '@glimmer/component';
import { action } from "@ember/object";
import { Filter, IFilter, TextFilter } from './Class-Filter';
import RouterService from "@ember/routing/router-service";
import { get } from '@ember/object';
import { service } from "@ember/service";
import { tracked } from '@glimmer/tracking';

interface Args {
    filter: Filter;
    updateFilter: (object: any) => {};

}

export default class FilterComponent extends Component<Args> implements IFilter {
    @service declare router: RouterService;

    @tracked id?: string;
    @tracked searchLabel?: string;
    @tracked queryParam?: string;

    
    @action
    updateQueryParam(value: any) {
        if (this.queryParam) {
            this.router.transitionTo(this.router.currentRouteName, {
                queryParams: {
                    [this.queryParam]: value,
                },
            });
        }
    }
    
    init(component: FilterComponent) {
        component.id = component.args.filter.id;
        component.searchLabel = component.args.filter.searchLabel;

        component.queryParam = component.args.filter.queryParam;
    }
}
