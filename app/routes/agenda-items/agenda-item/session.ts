import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AgendaItemsAgendaItemSessionRoute extends Route {
  @service declare store: Store;

  async model({ session_id }: { session_id: string }) {
    const { agenda_item_id: agendaItemId } = this.paramsFor(
      'agenda-items.agenda-item'
    ) as {
      agenda_item_id: string;
    };
    const session = await this.store.findRecord('session', session_id, {
      include: [
        'governing-body.is-time-specialization-of.administrative-unit.location',
        'governing-body.administrative-unit.location',
        'agenda-items',
      ].join(','),
    });
    return {
      agendaItemId,
      session,
    };
  }
}
