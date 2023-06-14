import { action } from "@ember/object";
import { get } from '@ember/object';
import FilterComponent from './filter';
import { tracked } from '@glimmer/tracking';

export default class SearcherTextFilterComponent extends FilterComponent {
    @tracked value?: any;
    @tracked placeholder?: string;

    @action
    searchUpdateFilter() {
        if (this.args.info.filterObject) {
            this.args.searcherUpdateFilter(this.args.info.filterObject(this.value));
        }
    }

    @action
    async onLoad() {
        this.init(this);

        this.value = this.getQueryParamValue();
        
        this.searchUpdateFilter();
    }

    @action
    async filterChange(e: Event) {
        if (e.target) {
            this.value = (e.target as HTMLInputElement).value;
        }

        this.updateQueryParam(this.value);
        this.searchUpdateFilter();
    }
}
