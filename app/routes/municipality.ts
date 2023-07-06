import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import Ember from 'ember';

interface AgendaItemsRequestInterface {
  page: {
    size: number;
  };
  include: string;
  municipality?: string;
  filter?: {
    ':or:'?: {};
    session?: {
      'governing-body'?: {
        'administrative-unit': {
          name?: {};
          location?: {};
        };
      };
    };
  };
}

export default class MunicipalityRoute extends Route {
  @service declare store: Store;

  queryParams = {
    page: { refreshModel: true },
  };

  async model(params: any) {
    const { municipality, page } = params;

    const req: AgendaItemsRequestInterface = {
      page: {
        size: 10,
      },
      municipality: municipality,
      include: [
        'session',
        'session.governing-body',
        'session.governing-body.administrative-unit',
      ].join(','),
      filter: {},
    };

    const sessionFilter: { [key: string]: any } = {};
    sessionFilter['governing-body'] = {
      'administrative-unit': { name: municipality },
    };
    req.filter = {};

    req.filter.session = sessionFilter;

    const data = await Ember.RSVP.hash({
      gemeenteraadsleden: [],
      agenda_items: this.store.query('agenda-item', req),
      title: municipality,
    });
    return data;
  }
}
