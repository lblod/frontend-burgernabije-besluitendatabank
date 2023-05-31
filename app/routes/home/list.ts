import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";

interface ResourcesInterface {
  page: {
    size: Number;
  };
  include: String;
  municipality?: String;
  filter?: {
    ":or:"?: {}
    session?: {}
  };
}

export default class ListRoute extends Route {
  @service declare store: Store;

  queryParams = {
    municipality: {
      refreshModel: true,
      as: "gemeente",
    },
    sort: {
      refreshModel: true,
      as: "sorteren",
    },
    plannedStartMin: {
      refreshModel: true,
      as: "begin",
    },
    plannedStartMax: {
      refreshModel: true,
      as: "eind",
    },
    keyWord: {
      refreshModel: true,
      as: "trefwoord",
    },
    offset: {
      refreshModel: true,
      as: "aantal",
    },
  };

  offset = 10;

  async model(params: any) {
    const municipality = params.gemeente ? params.gemeente : null;
    const sort = params.sort ? params.sort : "relevantie";
    const plannedStartMin = params.plannedStartMin ? params.plannedStartMin : null;
    const plannedStartMax = params.plannedStartMax ? params.plannedStartMax : null;
    const keyWord = params.keyWord ? params.keyWord : null;

    let queryParams: ResourcesInterface = {
      page: {
        size: params.offset,
      },
      municipality: municipality,
      // include: 'session,session.governing-agent',
      include: "session"
    };

    // Had to assign it here for typescript rr
    queryParams.filter = {};

    if (keyWord) {
      queryParams.filter[":or:"] = {
        "title": keyWord,
        "description": keyWord
      }
    }

    if (plannedStartMin || plannedStartMax || keyWord) {
      // Expected format: YYYY-MM-DD
      let sessionFilter: { [key: string]: any } = {};

      if (plannedStartMin) {
        sessionFilter[":gt:started-at"] = plannedStartMin;
      }
      if (plannedStartMax) {
        sessionFilter[":lt:ended-at"] = plannedStartMax;
      }
      queryParams.filter.session = sessionFilter;
    }

    let agendaItems = await this.store.query("agenda-item", queryParams);

    return agendaItems;
  }
}
