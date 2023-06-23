import Component from '@glimmer/component';
import { action } from "@ember/object";
import { tracked } from '@glimmer/tracking';

export default class SearcherSelectFilterComponent extends Component {
    @tracked options?: any;
    @tracked selected?: any;

    @action
    async selectChange(m: any) {
        this.selected = m;
    }
}
