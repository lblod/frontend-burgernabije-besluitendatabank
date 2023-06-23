import Component from '@glimmer/component';
import { action } from "@ember/object";
import { tracked } from '@glimmer/tracking';
import FilterComponent from './filter';

export default class SearcherSelectFilterComponent extends FilterComponent {
    @tracked options?: any;
    @tracked selected?: any;

    @action
    async selectChange(m: any) {
        let value = m ? m.label : ""
        this.updateQueryParams({
            [this.args.queryParam]: value
        });
    }
}
