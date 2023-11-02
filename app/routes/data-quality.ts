import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import GoverningBodyClasssificationCodeModel from 'frontend-burgernabije-besluitendatabank/models/governing-body-classification-code';
import MuSearchService from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import {
  AdapterPopulatedRecordArrayWithMeta,
  getCount,
} from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

export default class DataQualityRoute extends Route {
  @service declare muSearch: MuSearchService;
  @service declare store: Store;

  // add location ids as a query param
  queryParams = {
    municipalityLabels: {
      as: 'gemeentes',
      refreshModel: true,
    },
  };

  async model(params: { municipalityLabels: string[] }) {
    let agendaItemsPerGoverningBodyClassification = [];

    const totalCountAgendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query('agenda-item', {
        filter: {
          // sessions: {
          //   'governing-body': {
          //     location: {
          //       label: params.municipalityLabels || '',
          //     },
          //   },
          // },
        },
        size: 1,
      });

    const totalCountAgendaItemsWithTitleAndDescription: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query('agenda-item', {
        filter: {
          ':has:title': true,
          ':has:description': true,
          // sessions: {
          //   'governing-body': {
          //     location: {
          //       label: params.municipalityLabels || '',
          //     },
          //   },
          // },
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
              // 'governing-body': {
              //   location: {
              //     label: params.municipalityLabels || '',
              //   },
              // },
            },
          },
        },
        size: 1,
      });

    // get all classifications (governing bodies) from the store
    //TODO: replace the test query with an actual query for the classifications
    const allGoverningBodyClassifications: AdapterPopulatedRecordArrayWithMeta<GoverningBodyClasssificationCodeModel> =
      await this.store.query('governing-body-classification-code', {
        filter: {
          // name: 'Knokke',
          'administrative-unit': {
            location: {
              label: params.municipalityLabels || 'Knokke',
            },
          },
        },
        size: 600,
      });

    // put all of the classifications through a loop to get the count of agenda items per classification
    //TODO: replace name with id of the classification
    const agendaItemsPromises = allGoverningBodyClassifications.map(
      async (governingBody) => {
        const agendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
          await this.store.query('agenda-item', {
            filter: {
              sessions: {
                'governing-body': {
                  'governing-body-classification-code': governingBody.label,
                },
              },
            },
            size: 1,
          });

        return {
          classification: governingBody.label,
          count: getCount(agendaItems) || 0,
        };
      }
    );

    // resolve the promises
    agendaItemsPerGoverningBodyClassification = await Promise.all(
      agendaItemsPromises
    );

    return {
      totalCountAgendaItems: getCount(totalCountAgendaItems),
      totalCountAgendaItemsTreated: getCount(totalCountAgendaItemsTreated),
      totalCountAgendaItemsWithTitleAndDescription: getCount(
        totalCountAgendaItemsWithTitleAndDescription
      ),
      agendaItemsPerGoverningBodyClassification:
        // sort by count descending
        agendaItemsPerGoverningBodyClassification.sort(
          (a, b) => (b.count || 0) - (a.count || 0)
        ),
    };
  }
}
