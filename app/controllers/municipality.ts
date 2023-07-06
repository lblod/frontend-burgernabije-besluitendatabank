import Store from '@ember-data/store';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
export default class MunicipalityController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;

  //@tracked options = ["antwerpen"];
  @tracked selected = '';
  @action handleKeywordChange() {}

  @tracked queryParams = ['page'];
  @tracked page = 0;

  @tracked startDate = undefined;
  @tracked endDate = undefined;

  @action handleMunicipalityChange(m: any) {
    this.selected = m.name;
    this.router.transitionTo('municipality', {
      queryParams: {
        gemeente: this.selected,
      },
    });
  }
}
