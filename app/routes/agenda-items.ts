import Store from "@ember-data/store";
import Error from "@ember/error";
import { action } from "@ember/object";
import Route from "@ember/routing/route";
import Transition from "@ember/routing/transition";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import KeywordStoreService from "frontend-burgernabije-besluitendatabank/services/keyword-store";

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
  sort: "-session.started-at",
  filter: {
    session: {
      ":gt:started-at": plannedStartMin ? plannedStartMin : undefined,
      ":lt:ended-at": plannedStartMax ? plannedStartMax : undefined,
      ":has:governing-body": true,
      "governing-body": {
        ":has:administrative-unit": true,
        "administrative-unit": {
          ":has:name": municipality ? true : false,  // If this is true whilst name is undefined, it bugs out
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
  sort?: string;
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
  @service declare keywordStore: KeywordStoreService;

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

  @action
  error(error: Error) {
    let controller: any = this.controllerFor("agenda-items");
    controller.set("errorMsg", error.message);
    return true;
  }

  @action
  loading(transition: any, originRoute: any) {
    let controller: any = this.controllerFor("agenda-items");

    controller.set("loading", true);
    transition.promise.finally(() => {
      controller.set("loading", false);
    });
  }

  async model(params: any, transition: Transition<unknown>) {
    const controller: any = this.controllerFor("agenda-items");
    const model: any = this.modelFor("agenda-items");

    if (
      model?.agendaItems?.toArray().length > 0 &&
      params.keyword === this.keywordStore.keyword &&
      params.municipality === this.municipality &&
      params.sort === this.sort &&
      params.plannedStartMin === this.plannedStartMin &&
      params.plannedStartMax === this.plannedStartMax
    ) {
      return model;
    }
    this.keywordStore.keyword = params.keyword || "";
    this.municipality = params.municipality || "";
    this.sort = params.sort || "";
    this.plannedStartMin = params.plannedStartMin || "";
    this.plannedStartMax = params.plannedStartMax || "";

    // Check if the parameters have changed compared to the last time

    const currentPage = 0;
    const agendaItems = await this.store.query(
      "agenda-item",
      getQuery({
        page: currentPage,
        keyword: this.keywordStore.keyword != "" ? this.keywordStore.keyword : undefined,
        municipality: this.municipality != "" ? this.municipality : undefined,
        plannedStartMin: this.plannedStartMin != ""
          ? this.plannedStartMin
          : undefined,
        plannedStartMax: this.plannedStartMax != ""
          ? this.plannedStartMax
          : undefined,
      })
    );

    return {
      agendaItems: agendaItems.toArray(),
      currentPage: currentPage,
      getQuery,
    };
  }
}
