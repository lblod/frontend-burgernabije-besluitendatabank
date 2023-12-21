import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

interface Params {
  id: string;
}

export default class AgendaItemsAgendaItemSessionRoute extends Route {
  @service declare store: Store;

  async model({ id }: Params) {
    const agendaItem = await this.store.findRecord('agenda-item', id);
    const sessions = await agendaItem.sessions;

    const session = await this.store.findRecord(
      'session',
      sessions?.firstObject?.id as string,
      {
        include: [
          'governing-body.is-time-specialization-of.administrative-unit.location',
          'governing-body.administrative-unit.location',
          'agenda-items',
        ].join(','),
      }
    );

    return {
      agendaItem,
      session,
    };
  }
}
