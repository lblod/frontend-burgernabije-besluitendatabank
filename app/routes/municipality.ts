import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { hash } from 'rsvp';

interface AgendaItemsRequestInterface {
  page: {
    size: number;
  };
  include: string;
  municipality?: string;
  filter?: {
    ':or:'?: unknown;
    sessions?: {
      'governing-body'?: {
        'is-time-specialization-of'?: {
          'administrative-unit': {
            location?: unknown;
          };
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
    const { municipality } = params;

    const req: AgendaItemsRequestInterface = {
      page: {
        size: 10,
      },
      municipality: municipality,
      include:
        'sessions.governing-body.is-time-specialization-of.administrative-unit.location',
      filter: {},
    };

    const sessionFilter: { [key: string]: any } = {};
    sessionFilter['governing-body'] = {
      'is-time-specialization-of': {
        'administrative-unit': {
          location: {
            label: municipality,
          },
        },
      },
    };
    req.filter = {};

    req.filter.sessions = sessionFilter;

    const data = await hash({
      gemeenteraadsleden: [],
      agenda_items: this.store.query('agenda-item', req),
      title: municipality,
    });
    return data;
  }
}
