import Component from '@glimmer/component';
import { action } from "@ember/object";
import FilterComponent from './filter';
import { tracked } from '@glimmer/tracking';

export default class SearcherSelectFilterComponent extends FilterComponent {
    @tracked options?: any;
    @tracked selected?: any;

    @action
    searchUpdateFilter() {
        if (this.args.info.filterObject) {
            this.args.searcherUpdateFilter(this.args.info.filterObject(this.selected.label));
        }
    }

    @action
    async onLoad() {
        this.init(this);

        this.options = this.args.info.options;
        
        let value = this.getQueryParamValue();
        if (value) {
            this.selected = {
                label: this.getQueryParamValue()
            };
            this.searchUpdateFilter();

        }
        
        
    }


    @action
    async selectChange(m: any) {
        this.selected = m;
        this.updateQueryParam(this.selected.label);
        this.searchUpdateFilter();
    }
}
