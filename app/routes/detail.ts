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

export default class DetailRoute extends Route {
  @service declare store: Store;
  @service declare keywordStore: KeywordStoreService;

  async model(params: DetailParams) {
    const agendaItem = await this.store.findRecord('agenda-item', params.id);

    // wait until sessions are loaded
    const sessions = await agendaItem.sessions;
    // SessionModel expects the following to be loaded:
    // - governingBody.isTimeSpecializationOf.administrativeUnit.location
    // - governingBody.administrativeUnit.location
    // to resolve municipality & governingBody name
    await Promise.all(
      sessions?.map(async (session) => {
        const governingBody = await session.governingBody;
        const isTimeSpecializationOf =
          await governingBody?.isTimeSpecializationOf;
        let administrativeUnit =
          await isTimeSpecializationOf?.administrativeUnit;
        await administrativeUnit?.location;
        administrativeUnit = await governingBody?.administrativeUnit;
        await administrativeUnit?.location;
      }) || []
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
