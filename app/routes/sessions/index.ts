import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";

const getQuery = (page: number) => ({
  // exclude sessions without governing body and administrative unit
  //todo investigate why filtering is not working
  filter: {
    ":has:governing-body": true,
    "governing-body": {
      ":has:administrative-unit": true,
    },
  },
  include: ["governing-body.administrative-unit", "agenda-items"].join(","),
  page: {
    number: page,
  },
});

export default class SessionsIndexRoute extends Route {
  @service declare store: Store;

  async model() {
    const model: any = this.modelFor("sessions.index");
    if (model?.sessions?.toArray().length > 0) {
      return model;
    }

    const currentPage = 0;
    const sessions = await this.store.query("session", getQuery(currentPage));

    return {
      sessions: sessions.toArray(),
      currentPage: currentPage,
      getQuery,
    };
  }
}
