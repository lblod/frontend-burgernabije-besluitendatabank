import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

interface AgendaItemsRequestInterface {
  page: {
    size: number;
  };
  include: string;
  municipality?: string;
  filter?: {
    ':has:session'?: boolean;
    session?: {
      ':gt:planned-start'?: string;

      ':has:governing-body'?: boolean;
      'governing-body'?: {
        ':has:administrative-unit'?: boolean;
        'administrative-unit': {
          ':has:name'?: boolean;
          name?: object;
        };
      };
    };
  };
}

export default class MapRoute extends Route {
  @service declare store: Store;

  async model() {
    const locationData = await this.store.findAll('location', {});

    const req: AgendaItemsRequestInterface = {
      page: {
        size: 600,
      },
      include: [
        'session',
        'session.governing-body',
        'session.governing-body.administrative-unit',
        'session.governing-body.administrative-unit.location',
      ].join(','),
      filter: {
        ':has:session': true,
        session: {
          ':gt:planned-start': new Date(
            new Date().setMonth(new Date().getMonth() - 3)
          )
            .toISOString()
            .split('T')[0],
          ':has:governing-body': true,
          'governing-body': {
            ':has:administrative-unit': true,
            'administrative-unit': {
              ':has:name': true,
            },
          },
        },
      },
    };

    const agendaData = await this.store
      .query('agenda-item', req)
      .then((data) => {
        return data.filter((item) => {
          return item.session?.get('governingBody')?.get('administrativeUnit')
            ?.name;
        });
      });

    return {
      locationData: locationData,
      agendaData: agendaData,
    };
  }
}
