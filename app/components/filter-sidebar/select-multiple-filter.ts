import { action } from "@ember/object";
import FilterComponent from './filter';
import { get } from '@ember/object';
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import Store from "@ember-data/store";

const seperator = '+';
const regex = new RegExp("\\" + seperator + "$", "m");

export default class SelectMultipleFilterComponent extends FilterComponent {
    @tracked selected: any;


    @action
    async inserted() {
        // The queryParam is an array of searchField values, joined by seperator
        // On the page load, we can use this to load in values
        let queryParam = this.getQueryParam(this.args.queryParam);
        if (queryParam) {
            const needles = queryParam.split(seperator);
            const searchField = this.args.searchField;

            this.args.options.then((haystack: [{[key:string]: any}]) => {
                if (!queryParam) return;  // TypeScript was being wacky

                let results: Array<{[key:string]: any}> = [];

                for (let i = 0; i < needles.length; i++) {
                    let needle = needles[i];
                    console.log("Search for: " + needle)
                    let found = haystack.find((value) => get(value, searchField) == needle);
                    if (found) {
                        results.push(found);
                    }
                }
                
                this.selected = results;
            });
        }
    }

    @action
    async selectChange(m: []) {
        // Update UI
        this.selected = m;

        // Update queryParameters
        let values = "";
        for (let i = 0; i < m.length; i++) {
            values += get(m[i], this.args.searchField) + seperator;
        }
        values = values.replace(regex, "");
        
        this.updateQueryParams({
            [this.args.queryParam]: values
        });
    }
}
