import Component from '@glimmer/component';
import { action } from "@ember/object";
import { tracked } from '@glimmer/tracking';

export default class SearcherDateRangeFilterComponent extends Component {
  @tracked start?: string;
  @tracked end?: string;


  @action
  async dateChange(e: any, start: string, end: string) {
    this.start = start;
    this.end = end;

  }
}
