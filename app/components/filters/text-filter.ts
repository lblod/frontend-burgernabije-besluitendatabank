import FilterComponent from './filter';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_TIME = 300;

export default class TextFilterComponent extends FilterComponent {
  onChange = task({ restartable: true }, async (event: Event) => {
    await timeout(DEBOUNCE_TIME);

    if (event.target) {
      const value = (event.target as HTMLInputElement).value;
      this.updateQueryParams({
        [this.args.queryParam]: value,
      });
    }
  });
}
