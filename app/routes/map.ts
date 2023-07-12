import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';

interface AgendaItemsRequestInterface {
  page: {
    size: number;
  };
  include: string;
  municipality?: string;
  filter?: {
    sessions?: {
      ':gt:planned-start'?: string;
      'governing-body'?: {
        'is-time-specialization-of': {
          'administrative-unit': {
            location?: {
              label?: string;
            };
          };
        };
      };
    };
  };
}

export default class MapRoute extends Route {
  @service declare store: Store;
  async model(params: object, transition: Transition<unknown>) {
    const locationData = await this.store.findAll('location', {});

    const req: AgendaItemsRequestInterface = {
      page: {
        size: 600,
      },
      include: [
        'sessions.governing-body.is-time-specialization-of.administrative-unit.location',
        'sessions.governing-body.administrative-unit.location',
      ].join(','),
      filter: {
        sessions: {
          ':gt:planned-start': new Date(
            new Date().setMonth(new Date().getMonth() - 3)
          )
            .toISOString()
            .split('T')[0],
        },
      },
    };

    const agendaData = await this.store
      .query('agenda-item', req)
      .then((data) => {
        return data.filter((item) => {
          return item.session?.hasMunicipality;
        });
      });

    return {
      locationData: locationData,
      agendaData: agendaData,
    };
  }
}
