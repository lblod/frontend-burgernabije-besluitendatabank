import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import MandataryModel from 'frontend-burgernabije-besluitendatabank/models/mandatary';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';

interface DetailParams {
  id: string;
}

interface FormattedTableVote {
  proponent: MandataryModel | null;
  opponent: MandataryModel | null;
  abstainer: MandataryModel | null;
}

export default class DetailRoute extends Route {
  @service declare store: Store;
  @service declare keywordStore: KeywordStoreService;

  async model(params: DetailParams) {
    const agendaItem: AgendaItemModel = await this.store.findRecord(
      'agenda-item',
      params.id
    );

    const sessionId = agendaItem.session?.id;
    const agendaItemOnSameSessionRaw = sessionId
      ? await this.store.query('agenda-item', {
          filter: {
            sessions: {
              [':id:']: sessionId,
            },
          },
        })
      : [];

    const agendaItemOnSameSession = agendaItemOnSameSessionRaw
      .filter((item) => item.id !== agendaItem.id)
      .sort(sortObjectsByTitle)
      .slice(0, 4);

    const agendaItemHandling = await agendaItem.handledBy;
    const vote = (await agendaItemHandling?.hasVotes)?.toArray().shift();

    const similiarAgendaItems = await this.store.query('agenda-item', {
      page: {
        size: 4,
      },
      municipality: agendaItem.session?.municipality,
      filter: {
        sessions: {
          'governing-body': {
            'is-time-specialization-of': {
              'administrative-unit': {
                location: {
                  label: agendaItem.session?.municipality,
                },
              },
            },
          },
        },
        ':or:': {
          title: this.keywordStore.keyword
            ? this.keywordStore.keyword
            : undefined,
          description: this.keywordStore.keyword
            ? this.keywordStore.keyword
            : undefined,
        },
      },
    });

    return {
      agendaItem,
      vote,
      agendaItemOnSameSession,
      similiarAgendaItems,
    };
  }
}
