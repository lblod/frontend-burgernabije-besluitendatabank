import FilterComponent from "./filter";
import { action } from "@ember/object";

export default class TextFilterComponent extends FilterComponent {
    
    @action
    async onChange(e: Event) {
        if (e.target) {
            let value = (e.target as HTMLInputElement).value;
            this.updateQueryParams({
                [this.args.queryParam]: value
            });

        }
    }
}
