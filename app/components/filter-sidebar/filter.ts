import Component from '@glimmer/component';
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { get } from '@ember/object';
import { service } from "@ember/service";
import { tracked } from '@glimmer/tracking';

interface ArgsInterface {
    id: string;
    queryParam: string;
}

export default class FilterComponent extends Component<ArgsInterface> {
    @service declare router: RouterService;

    @tracked id?: string;
    @tracked searchLabel?: string;
    @tracked queryParam?: string;
    @tracked queryParams?: Array<string>;


    updateQueryParams(params: object) {
        this.router.transitionTo(this.router.currentRouteName, {
            queryParams: params,
        });
    }

    /*
    
    @action
    updateQueryParam(value: any, key?: any) {
        if (key == null && this.queryParam) {
            key = this.queryParam
        }

        if (key) {
            this.router.transitionTo(this.router.currentRouteName, {
                queryParams: {
                    [key]: value,
                },
            });
        }
    }

    /*
    @action
    updateQueryParams(values: Array<string>, keys?: Array<string>) {
        if (keys == null && this.queryParams) {
            keys = this.queryParams;
        }

        if (keys) {
            let object: {[key:string]: string} = {};
            for (let i = 0; i < values.length; i++) {
                let key = keys[i];
                let value = values[i];
                if (key && value) {
                    object[key] = value; 
                }
            }

            this.router.transitionTo(this.router.currentRouteName, {
                queryParams: object,
            });
        }
    }
    
    

    getQueryParamValue(): any|undefined {
        if (this.queryParam) {
            let value = get(this.router.currentRoute.queryParams, this.queryParam);
            if (value) {
                return value;
            }
        }
        return undefined;
    }

    @action
    getQueryParamsValues(): any|undefined {
        if (this.queryParams) {
            let keys = this.queryParams;
            let values = [];

            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (key) {
                    let value = get(this.router.currentRoute.queryParams, key);
                    if (value) {
                        values.push(value);
                    }
                }

            }
            return values
        } else {
            return undefined
        }
    }
    
    init(component: FilterComponent) {
        component.id = component.args.info.id;
        component.searchLabel = component.args.info.searchLabel;

        component.queryParam = component.args.info.queryParam;
        component.queryParams = component.args.info.queryParams;
    }
    */
}
