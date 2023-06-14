import Component from '@glimmer/component';
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { get } from '@ember/object';
import { service } from "@ember/service";
import { tracked } from '@glimmer/tracking';

export interface IFilterInfo {

    /** 
     * id to be used in HTML
     * Example 1: \<input id="ID"\>
     * Example 2: \<label for="ID"\> 
     **/
    id?: string;

    /**
     * Text that will be diplayed above the input
     */
    searchLabel?: string;


    value? :string;

    /**
     * (Optional) Name of the queryParameter related to the input
     */
    queryParam?: string;

    /**
     * (Optional) Name of the queryParameters related to the input. Currently only used in DateRangeFilter
     */
    queryParams?: Array<string>;


    /**
     * Return a filter object for use in Ember's store.query("model", {filter: FILTER})
     * The generated object will be combined with any other filters and parsed to the (JSON:API) request
     * 
     * 
     * @example
     *  filter: (value: string) => {
     *      return {
     *          ":or:": {
     *              title: value,
     *              description: value
     *          }
     *      }
     * 
     * 
     * @example
     *  filter: (value: string) => {
     *      "session": {
     *          "governing-body": {
     *              "administrative-unit": {
     *                  "name": value
     *              }
     *          }
     *       }
     *   }
     * 
     * 
     * 
     * @param value The function should take one value, which will be used in the request 
     * @returns A JavaScript object for use in Ember/JSON:API queries
     */
    filterObject?: (value: any) => { [key:string]: any };


    placeholder?: any;
    options?: any;
    start?: string;
    end?: string;
};



interface FilterArgs {
    info: IFilterInfo;
    searcherUpdateFilter: (object: any) => {};
}

export default class FilterComponent extends Component<FilterArgs> implements IFilterInfo {
    @service declare router: RouterService;

    @tracked id?: string;
    @tracked searchLabel?: string;
    @tracked queryParam?: string;

    
    @action
    updateQueryParam(value: any, queryParam?: any) {
        if (queryParam == null && this.queryParam) {
            queryParam = this.queryParam
        }

        if (queryParam) {
            this.router.transitionTo(this.router.currentRouteName, {
                queryParams: {
                    [queryParam]: value,
                },
            });
        }
    }
    
    init(component: FilterComponent) {
        component.id = component.args.info.id;
        component.searchLabel = component.args.info.searchLabel;

        component.queryParam = component.args.info.queryParam;
    }
}
