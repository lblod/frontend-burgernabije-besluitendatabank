import { action } from "@ember/object";
import { get } from '@ember/object';
import FilterComponent from './filter';
import { tracked } from '@glimmer/tracking';

export default class SearcherTextFilterComponent extends FilterComponent {
    @tracked value?: any;
    @tracked placeholder?: string;

    @action
    updateFilter() {
        if (this.args.info.filterObject) {
            this.args.searcherUpdateFilter(this.args.info.filterObject(this.value));
        }
    }

    @action
    async onLoad() {
        this.init(this);

        console.log("---")
        console.log(this.queryParam)
        if (this.queryParam) {
            console.log(this.router.currentRoute.queryParams)
            let value = get(this.router.currentRoute.queryParams, this.queryParam);
            console.log(value)
            if (value) {
                this.value = value;
            }
        }
        this.updateFilter();
    }

    @action
    async filterChange(e: Event) {
        if (e.target) {
            this.value = (e.target as HTMLInputElement).value;
        }

        this.updateQueryParam(this.value);
        this.updateFilter();
    }
}
