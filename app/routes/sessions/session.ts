import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SessionRoute extends Route {
  @service declare store: Store;

  async model({ session_id }: { session_id: string }) {
    return this.store.findRecord('session', session_id, {
      include: ['governing-body.administrative-unit', 'agenda-items'].join(','),
    });
  }
}
