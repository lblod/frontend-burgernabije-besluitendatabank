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

    const formattedTableVote: FormattedTableVote[] = [];

    // add the votes to formattedTableVote in the form of [{proponent: {proponent1}, opponent: {oponent1}, abstainer: {abstainer1}},{proponent: {proponent2}, opponent: {oponent2}, abstainer: {abstainer2}},... ]
    // iterate over all 3 arrays (proponent, opponent, abstainer) and push only one voter to the formattedTableVote array each iteration
    // this means that the length of the formattedTableVote array will be the length of the longest array (proponent, opponent, abstainer)
    // if there is no voter, push an empty object

    const agendaItemHandling = await agendaItem.handledBy;
    const vote = (await agendaItemHandling?.hasVotes)?.toArray().shift();

    //TODO: The vote formatting is not the responssibility of the route. Move this logic to the component.
    // https://binnenland.atlassian.net/browse/BNB-246
    const proponents = (await vote?.hasProponents)?.toArray();
    const opponents = (await vote?.hasOpponents)?.toArray();
    const abstainers = (await vote?.hasAbstainers)?.toArray();
    // get the length of the longest array (not the accumaleted length of all 3 arrays)
    const longestArrayLength = Math.max(
      proponents?.length || 0,
      opponents?.length || 0,
      abstainers?.length || 0
    );

    // iterate over the longest array
    for (let i = 0; i < longestArrayLength; i++) {
      // push the proponent, opponent and abstainer of the current iteration to the formattedTableVote array
      formattedTableVote.push({
        proponent: proponents?.[i] || null,
        opponent: opponents?.[i] || null,
        abstainer: abstainers?.[i] || null,
      });
    }

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
      formattedTableVote,
      similiarAgendaItems,
    };
  }
}
