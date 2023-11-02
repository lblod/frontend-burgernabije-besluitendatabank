import Store from '@ember-data/store';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import MuSearchService from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import {
  AdapterPopulatedRecordArrayWithMeta,
  getCount,
} from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

export default class DataQualityRoute extends Route {
  @service declare muSearch: MuSearchService;
  @service declare store: Store;

  @action
  loading(transition: Transition) {
    // eslint-disable-next-line ember/no-controller-access-in-routes
    const controller: any = this.controllerFor('data-quality');
    controller.set('currentlyLoading', true);
    transition.promise.finally(function () {
      controller.set('currentlyLoading', false);
    });
  }

  queryParams = {
    municipalityLabel: {
      as: 'gemeentes',
      refreshModel: true,
    },
  };

  async model(params: { municipalityLabel: string[] }) {
    let agendaItemsPerGoverningBodyClassification = [];

    const totalCountAgendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query('agenda-item', {
        filter: {
          sessions: {
            'governing-body': {
              'administrative-unit': {
                location: {
                  label: params.municipalityLabel || undefined,
                },
              },
            },
          },
        },
        size: 1,
      });

    const totalCountAgendaItemsWithTitleAndDescription: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query('agenda-item', {
        filter: {
          ':has:title': true,
          ':has:description': true,
          sessions: {
            'governing-body': {
              'administrative-unit': {
                location: {
                  label: params.municipalityLabel || undefined,
                },
              },
            },
          },
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
          sessions: {
            'governing-body': {
              'administrative-unit': {
                location: {
                  label: params.municipalityLabel || undefined,
                },
              },
            },
          },
        },
        size: 1,
      });

    // get all classifications (governing bodies) from the store and dont get duplicates
    const allGoverningBodyClassifications = await this.store.findAll(
      'governing-body-classification-code'
    );

    // put all of the classifications through a loop to get the count of agenda items per classification

    const agendaItemsPromises = allGoverningBodyClassifications
      .filter(
        // filter out duplicates
        (classification, index, self) =>
          self.findIndex((c) => c.label === classification.label) === index
      )
      .map(async (governingBody) => {
        const agendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
          await this.store.query('agenda-item', {
            filter: {
              sessions: {
                'governing-body': {
                  'administrative-unit': {
                    location: {
                      label: params.municipalityLabel || undefined,
                    },
                  },
                  classification: {
                    label: governingBody.label,
                  },
                },
              },
            },
            size: 1,
          });

        return {
          classification: governingBody.label,
          count: getCount(agendaItems) || 0,
        };
      });

    // resolve the promises
    agendaItemsPerGoverningBodyClassification = await Promise.all(
      agendaItemsPromises
    );

    agendaItemsPerGoverningBodyClassification =
      agendaItemsPerGoverningBodyClassification.map((item) => ({
        ...item,
        percentage:
          ((item.count || 0) / (getCount(totalCountAgendaItems) || 1)) * 50,
      }));

    agendaItemsPerGoverningBodyClassification.push({
      classification: 'Totaal',
      count: getCount(totalCountAgendaItems) || 0,
      percentage: 50,
    });

    return {
      totalCountAgendaItems: getCount(totalCountAgendaItems) || 0,
      totalCountAgendaItemsTreated: getCount(totalCountAgendaItemsTreated) || 0,
      totalCountAgendaItemsWithTitleAndDescription:
        getCount(totalCountAgendaItemsWithTitleAndDescription) || 0,
      agendaItemsPerGoverningBodyClassification:
        // first sort by label then sort by count descending set total at the begining
        agendaItemsPerGoverningBodyClassification
          .sort((a, b) =>
            (a.classification || '').localeCompare(b.classification || '')
          )
          .sort((a, b) => (b.count || 0) - (a.count || 0)),
    };
  }
}
