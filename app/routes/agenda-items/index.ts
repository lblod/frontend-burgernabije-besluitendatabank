import Route from '@ember/routing/route';

export default class AgendaItemsIndexRoute extends Route {
  queryParams = {
    municipalityLabels: {
      as: 'gemeentes',
    },
    plannedStartMin: {
      as: 'begin',
    },
    plannedStartMax: {
      as: 'eind',
    },
    keyword: {
      as: 'trefwoord',
    },
  };
}
