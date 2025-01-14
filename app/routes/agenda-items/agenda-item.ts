import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import AgendaItemController from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/agenda-item';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import ArticleModel from 'frontend-burgernabije-besluitendatabank/models/article';
import VoteModel from 'frontend-burgernabije-besluitendatabank/models/vote';
import GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';

interface DetailParams {
  id: string;
}

interface AgendaItemRouteModel {
  agendaItem: AgendaItemModel;
  vote?: VoteModel;
  articles: ArticleModel[];
  agendaItemOnSameSession: AgendaItemModel[];
  similiarAgendaItems: AgendaItemModel[];
}

export default class AgendaItemRoute extends Route {
  @service declare router: Route;
  @service declare store: Store;
  @service declare keywordStore: KeywordStoreService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;

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
      }) || [],
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
      .filter((item) => item.id !== agendaItem.id && !!item.title)
      .sort(sortObjectsByTitle)
      .slice(0, 4);

    const agendaItemHandling = await agendaItem.handledBy;
    const vote = (await agendaItemHandling?.hasVotes)?.slice().shift();

    // load resolution and articles
    const resolutions = await agendaItemHandling?.resolutions;
    const articles = (
      await Promise.all(
        resolutions?.map(async (resolution) => {
          return (await resolution.articles).slice();
        }) || [],
      )
    )
      .flat()
      .sort((a, b) => (a.number || '').localeCompare(b.number || ''));

    const locationId = agendaItem.session?.municipalityId;

    // load 5 similiar agenda items in order to filter out the current agenda item
    const similiarAgendaItems = (
      await this.store.query('agenda-item', {
        page: {
          size: 5,
        },
        'filter[:or:][sessions][governing-body][is-time-specialization-of][administrative-unit][location][:id:]':
          locationId,
        'filter[:or:][sessions][governing-body][administrative-unit][location][:id:]':
          locationId,
        filter: {
          ':or:': {
            title: this.keywordStore.keyword || undefined,
            description: this.keywordStore.keyword || undefined,
          },
        },
      })
    )
      .filter((item) => item.id !== agendaItem.id && !!item.title)
      .slice(0, 4);

    return {
      agendaItem,
      vote,
      articles,
      agendaItemOnSameSession,
      similiarAgendaItems,
    };
  }

  afterModel(model: AgendaItemRouteModel) {
    if (
      this.governingBodyDisabledList.list.includes(
        model.agendaItem.governingBodyIdResolved || '',
      )
    ) {
      this.router.transitionTo('agenda-items.index');
    }
  }

  resetController(
    controller: AgendaItemController,
    isExiting: boolean,
    transition: Transition,
  ) {
    super.resetController(controller, isExiting, transition);
    if (isExiting) {
      controller.closeModal();
    }
  }
}
