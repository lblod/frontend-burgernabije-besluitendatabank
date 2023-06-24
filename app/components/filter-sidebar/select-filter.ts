import { action } from "@ember/object";
import FilterComponent from './filter';
import { get } from '@ember/object';

export default class SearcherSelectFilterComponent extends FilterComponent {
    @action
    async selectChange(m: any) {
        let value = m ? get(m, this.args.searchField) : ""
        this.updateQueryParams({
            [this.args.queryParam]: value
        });
    }
}
