import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';

interface MunicipalityParams {
  municipality?: string;
  page?: number;
}

interface AgendaItemsRequestInterface {
  page: {
    size: number;
  };
  include: string;
  municipality?: string;
  filter?: {
    ':or:'?: object;
    session?: {
      'governing-body'?: {
        'administrative-unit': {
          name?: object;
          location?: object;
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

  async model(params: MunicipalityParams) {
    const { municipality } = params;

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

    const sessionFilter: { [key: string]: object } = {};
    sessionFilter['governing-body'] = {
      'administrative-unit': { name: municipality },
    };
    req.filter = {};

    req.filter.session = sessionFilter;

    const data = await hash({
      gemeenteraadsleden: [],
      agenda_items: this.store.query('agenda-item', req),
      title: municipality,
    });
    return data;
  }
}
