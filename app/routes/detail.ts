import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";

export default class DetailRoute extends Route {
  @service declare store: Store;

  async model(params: any) {
    let agendaItem = await this.store.findRecord("agenda-item", params.id, {
      include: [
        "session",
        // "session.governing-body",
        "session.governing-body.administrative-unit",
        // 'handled-by',
        "handled-by.has-votes",
        "handled-by.resolutions",
        // 'session.governing-body',
        "session.governing-body.administrative-unit",
        // 'handled-by.has-votes.has-presents',
        // 'handled-by.has-votes.has-abstainers',
        "handled-by.has-votes.has-abstainers.alias",
        "handled-by.has-votes.has-abstainers.has-membership.inner-group",
        // 'handled-by.has-votes.has-voters',
        // 'handled-by.has-votes.has-opponents',
        "handled-by.has-votes.has-opponents.alias",
        "handled-by.has-votes.has-opponents.has-membership.inner-group",
        // 'handled-by.has-votes.has-proponents',
        "handled-by.has-votes.has-proponents.alias",
        "handled-by.has-votes.has-proponents.has-membership.inner-group",
      ].join(","),
    });

    let agendaItemOnSameSession = await this.store.query("agenda-item", {
      page: {
        size: 4,
      },
      include: ["session"].join(","),
      filter: {
        session: {
          "started-at": agendaItem?.session
            ?.get("startedAt")
            ?.toISOString()
            ?.split("T")[0],
        },
      },
    });

    return {
      agendaItem: agendaItem,
      agendaItemOnSameSession: agendaItemOnSameSession,
    };
  }
}
