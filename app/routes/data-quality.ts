import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import MuSearchService from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import {
  AdapterPopulatedRecordArrayWithMeta,
  getCount,
} from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

interface MetaResponse {
  meta: {
    count: number;
  };
}
export default class DataQualityRoute extends Route {
  @service declare muSearch: MuSearchService;
  @service declare store: Store;

  async model() {
    // for future implementation of filtering on municipality
    const locationIds: string[] = [];

    const totalCountAgendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query('agenda-item', {
        filter: {},
        size: 1,
      });

    const totalCountAgendaItemsWithTitleAndDescription: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query('agenda-item', {
        filter: {
          ':has:title': true,
          ':has:description': true,
        },
        size: 1,
      });

    const totalCountAgendaItemsTreated: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query('agenda-item', {
        filter: {
          ':or:': {
            sessions: {
              ':has:started-at': true,
              ':has:ended-at': true,
            },
          },
        },
        size: 1,
      });

    return {
      totalCountAgendaItems: getCount(totalCountAgendaItems),
      totalCountAgendaItemsTreated: getCount(totalCountAgendaItemsTreated),
      totalCountAgendaItemsWithTitleAndDescription: getCount(
        totalCountAgendaItemsWithTitleAndDescription
      ),
    };
  }
}
