import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import type Store from '@ember-data/store';

const APPLICANT_CONCEPT_SCHEME_ID = 'e4671c49-ab7b-4e4f-aa4c-83f6a1683e52';
const REASON_CONCEPT_SCHEME_ID = '5e020412-f695-48d8-b3dc-393214e2236c';

export default class CiterraIndexRoute extends Route {
  @service declare store: Store;
  async model() {
    const applicantTypes = await this.store.query('concept', {
      'filter[concept-schemes][:id:]': APPLICANT_CONCEPT_SCHEME_ID,
      include: 'concept-schemes',
      sort: ':no-case:label',
      page: { size: 100 },
    });
    const reasons = await this.store.query('concept', {
      'filter[concept-schemes][:id:]': REASON_CONCEPT_SCHEME_ID,
      'filter[concept-schemes][label]': 'Reden',
      include: 'concept-schemes',
      sort: ':no-case:label',
      page: { size: 100 },
    });

    return {
      applicantTypes,
      reasons,
      geoPoints: [],
      zones: [],
    };
  }
}
