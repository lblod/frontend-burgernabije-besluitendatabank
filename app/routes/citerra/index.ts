import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import type Store from '@ember-data/store';

const CONCEPT_SCHEME_ID = 'e4671c49-ab7b-4e4f-aa4c-83f6a1683e52';

export default class CiterraIndexRoute extends Route {
  @service declare store: Store;
  async model() {
    const applicantTypes = await this.store.query('concept', {
      'filter[concept-schemes][:id:]': CONCEPT_SCHEME_ID,
      include: 'concept-schemes',
      sort: ':no-case:label',
    });
    return {
      applicantTypes,
    };
  }
}
