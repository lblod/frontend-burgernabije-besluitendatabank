import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import type AccountModel from 'frontend-burgernabije-besluitendatabank/models/account';
import type {
  MockLoginModel,
  MockUserEntry,
} from 'frontend-burgernabije-besluitendatabank/routes/mock-login';

export default class MockLoginController extends Controller {
  @service declare currentSession: CurrentSessionService;

  queryParams = ['search', 'page'];
  @tracked search = '';
  @tracked page = 0;
  @tracked error: string | null = null;

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
    await timeout(400); // debounce
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

  login = task({ drop: true }, async (user: MockUserEntry) => {
    this.error = null;
    const account: AccountModel = user.account;
    try {
      if (!account.mockLoginGroupId) {
        throw new Error(`Mock account ${account.id} has no group`);
      }
      await this.currentSession.mockLogin(account.id, account.mockLoginGroupId);
    } catch (error) {
      this.error = `Aanmelden als ${user.name} is mislukt.`;
      console.error(error);
    }
  });
}
