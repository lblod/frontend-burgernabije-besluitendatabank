import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { SEARCH_DEBOUNCE_MS } from 'frontend-burgernabije-besluitendatabank/constants/search';
import type { MockLoginModel } from 'frontend-burgernabije-besluitendatabank/routes/mock-login';

export default class MockLoginController extends Controller {
  queryParams = ['search', 'page'];
  @tracked search = '';
  @tracked page = 0;

  declare model: MockLoginModel;

  get pageLabel() {
    return `Pagina ${this.model.page + 1} van ${this.model.lastPage + 1}`;
  }

  get hasPreviousPage() {
    return this.model.page > 0;
  }

  get hasNextPage() {
    return this.model.page < this.model.lastPage;
  }

  updateSearch = task({ restartable: true }, async (value: string) => {
    await timeout(SEARCH_DEBOUNCE_MS);
    this.page = 0;
    this.search = value;
  });

  @action
  onSearchInput(event: Event) {
    this.updateSearch.perform((event.target as HTMLInputElement).value);
  }

  @action
  previousPage() {
    this.page = Math.max(0, this.model.page - 1);
  }

  @action
  nextPage() {
    this.page = Math.min(this.model.lastPage, this.model.page + 1);
  }
}
