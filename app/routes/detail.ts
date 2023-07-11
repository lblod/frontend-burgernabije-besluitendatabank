import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';

const agendaItemIncludes = [
  'handled-by.has-votes',
  'handled-by.resolutions',
  'handled-by.has-votes.has-abstainers.alias',
  'handled-by.has-votes.has-abstainers.has-membership.inner-group',
  'handled-by.has-votes.has-opponents.alias',
  'handled-by.has-votes.has-opponents.has-membership.inner-group',
  'handled-by.has-votes.has-proponents.alias',
  'handled-by.has-votes.has-proponents.has-membership.inner-group',
  'sessions.governing-body.is-time-specialization-of.administrative-unit.location',
].join(',');

export default class DetailRoute extends Route {
  @service declare store: Store;
  @service declare keywordStore: KeywordStoreService;

  async model(params: any) {
    const agendaItem = await this.store.findRecord('agenda-item', params.id, {
      include: agendaItemIncludes,
    });

    const sessionId = agendaItem.session?.get('id');
    const agendaItemOnSameSessionRaw = sessionId
      ? await this.store.query('agenda-item', {
          include: agendaItemIncludes,
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

    const formattedTableVote: any[] = [];

    // add the votes to formattedTableVote in the form of [{proponent: {proponent1}, opponent: {oponent1}, abstainer: {abstainer1}},{proponent: {proponent2}, opponent: {oponent2}, abstainer: {abstainer2}},... ]
    // iterate over all 3 arrays (proponent, opponent, abstainer) and push only one voter to the formattedTableVote array each iteration
    // this means that the length of the formattedTableVote array will be the length of the longest array (proponent, opponent, abstainer)
    // if there is no voter, push an empty object

    // get the length of the longest array (not the accumaleted length of all 3 arrays)
    const longestArrayLength = Math.max(
      agendaItem.handledBy
        .get('hasVotes')
        ?.toArray()[0]
        ?.hasProponents.toArray().length || 0,
      agendaItem.handledBy.get('hasVotes')?.toArray()[0]?.hasOpponents.toArray()
        .length || 0,
      agendaItem.handledBy
        .get('hasVotes')
        ?.toArray()[0]
        ?.hasAbstainers.toArray().length || 0
    );

    // iterate over the longest array
    for (let i = 0; i < longestArrayLength; i++) {
      // push the proponent, opponent and abstainer of the current iteration to the formattedTableVote array
      formattedTableVote.push({
        proponent:
          agendaItem.handledBy
            .get('hasVotes')
            .toArray()[0]
            ?.hasProponents?.toArray()[i] || undefined,
        opponent:
          agendaItem.handledBy
            .get('hasVotes')
            .toArray()[0]
            ?.hasOpponents?.toArray()[i] || undefined,
        abstainer:
          agendaItem.handledBy
            .get('hasVotes')
            .toArray()[0]
            ?.hasAbstainers?.toArray()[i] || undefined,
      });
    }

    const similiarAgendaItems = await this.store.query('agenda-item', {
      page: {
        size: 4,
      },
      municipality: agendaItem.session?.get('municipality') || undefined,
      filter: {
        sessions: {
          'governing-body': {
            'is-time-specialization-of': {
              'administrative-unit': {
                location: {
                  label: agendaItem.session?.get('municipality') || undefined,
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
      agendaItemOnSameSession,
      formattedTableVote,
      similiarAgendaItems,
    };
  }
}
