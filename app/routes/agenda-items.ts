import Store from "@ember-data/store";
import Error from "@ember/error";
import { action } from "@ember/object";
import Route from "@ember/routing/route";
import Transition from "@ember/routing/transition";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

interface MunicipalitiesRequestInterface {
  page: {
    size: Number;
  };
  include?: String;
  municipality?: String;
  filter?: {
    niveau?: {};
    session?: {
      "governing-body"?: {
        "administrative-unit": {
          name?: {};
          location?: {};
        };
      };
    };
  };
}

const getQuery = ({
  page,
  keyword,
  municipality,
  plannedStartMin,
  plannedStartMax,
}: {
  page: number;
  keyword?: string;
  municipality?: string;
  plannedStartMin?: string;
  plannedStartMax?: string;
}): AgendaItemsRequestInterface => ({
  // exclude sessions without governing body and administrative unit
  //todo investigate why filtering is not working
  include: [
    "session",
    "session.governing-body",
    "session.governing-body.administrative-unit",
    "session.governing-body.administrative-unit.location",
  ].join(","),
  municipality: municipality ? municipality : undefined,
  filter: {
    session: {
      ":gt:started-at": plannedStartMin ? plannedStartMin : undefined,
      ":lt:ended-at": plannedStartMax ? plannedStartMax : undefined,
      ":has:governing-body": true,
      "governing-body": {
        ":has:administrative-unit": true,
        "administrative-unit": {
          ":has:name": true,
          name: municipality ? municipality : undefined,
        },
      },
    },
    ":or:": {
      title: keyword ? keyword : undefined,
      description: keyword ? keyword : undefined,
    },
  },
  page: {
    number: page,
    size: 10,
  },
});

interface AgendaItemsRequestInterface {
  page: {
    number: Number;
    size: Number;
  };
  include: String;
  municipality?: String | undefined;
  filter?: {
    ":or:"?: {};
    session?: {
      ":gt:started-at"?: String | undefined;
      ":lt:ended-at"?: String | undefined;
      ":has:governing-body"?: Boolean;
      "governing-body"?: {
        ":has:administrative-unit"?: Boolean;
        "administrative-unit": {
          ":has:name"?: Boolean;
          name?: any;
          location?: {};
        };
      };
    };
  };
}
export default class AgendaItemsRoute extends Route {
  @service declare store: Store;

  queryParams = {
    municipality: {
      as: "gemeentes",
      refreshModel: true,
    },
    sort: {
      as: "sorteren",
      refreshModel: true,
    },
    plannedStartMin: {
      as: "begin",
      refreshModel: true,
    },
    plannedStartMax: {
      as: "eind",
      refreshModel: true,
    },
    keyword: {
      as: "trefwoord",
      refreshModel: true,
    },
  };

  @tracked municipality: any;
  @tracked sort: any;
  @tracked plannedStartMin: any;
  @tracked plannedStartMax: any;
  @tracked keyword: any;

  @action
  error(error: Error) {
    let controller: any = this.controllerFor("home");
    controller.set("errorMsg", error.message);
    return true;
  }

  @action
  loading(transition: any, originRoute: any) {
    let controller: any = this.controllerFor("home");

    controller.set("loading", true);
    transition.promise.finally(() => {
      controller.set("loading", false);
    });
  }

  async model(params: any, transition: Transition<unknown>) {
    // const model: any = this.modelFor("home");
    // if (
    //   model?.agendaItems?.toArray().length > 0 &&
    // ) {
    //   return model;
    // }

    const currentPage = 0;
    const agendaItems = await this.store.query(
      "agenda-item",
      getQuery({
        page: currentPage,
        keyword: params.keyword ? params.keyword : undefined,
        municipality: params.municipality ? params.municipality : undefined,
        plannedStartMin: params.plannedStartMin
          ? params.plannedStartMin
          : undefined,
        plannedStartMax: params.plannedStartMax
          ? params.plannedStartMax
          : undefined,
      })
    );

    let req: MunicipalitiesRequestInterface = {
      page: { size: 600 },
      filter: {
        niveau: "Gemeente",
      },
    };
    const municipalities = this.store.query("location", req);
    return {
      agendaItems: agendaItems.toArray(),
      currentPage: currentPage,
      getQuery,
      municipalities: municipalities,
    };
  }
}
