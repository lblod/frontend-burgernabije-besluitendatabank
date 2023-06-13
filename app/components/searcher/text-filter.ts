import Component from '@glimmer/component';
import { action } from "@ember/object";
import { TextFilter } from './Class-Filter';
import { get } from '@ember/object';
import FilterComponent from './filter';
import { Filter } from './Class-Filter';
import { tracked } from '@glimmer/tracking';

export default class SearcherTextFilterComponent extends FilterComponent {
    @tracked value?: any;

    @action
    async onLoad() {
        this.init(this);

        if (this.queryParam) {
            let value = get(this.router.currentRoute.queryParams, this.queryParam);
            if (value) {
                this.value = value;
            }
        }

        this.args.updateFilter(this.args.filter.filter(this.value));
    }

    @action
    async filterChange(e: Event) {
        console.log(...arguments)
        console.log(this.id)


        if (e.target) {
            //this.value = (e.target as HTMLInputElement).value;
        }

        this.updateQueryParam(this.value);
        this.args.updateFilter(this.args.filter.filter(this.value));

    }
}
