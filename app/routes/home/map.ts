import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import Transition from "@ember/routing/transition";
import { service } from "@ember/service";

interface AgendaItemsRequestInterface {
  page: {
    size: Number;
  };
  include: String;
  municipality?: String;
  filter?: {
    ":has:session"?: boolean;
    session?: {
      ":gt:started-at"?: string;

      ":has:governing-body"?: boolean;
      "governing-body"?: {
        ":has:administrative-unit"?: boolean;
        "administrative-unit": {
          ":has:name"?: boolean;
          name?: {};
        };
      };
    };
  };
}

export default class MapRoute extends Route {
  @service declare store: Store;
  async model(params: object, transition: Transition<unknown>) {
    const locationData = await this.store.findAll("location", {});

    let req: AgendaItemsRequestInterface = {
      page: {
        size: 600,
      },
      include: [
        "session",
        "session.governing-body",
        "session.governing-body.administrative-unit",
        "session.governing-body.administrative-unit.location",
      ].join(","),
      filter: {
        ":has:session": true,
        session: {
          // ":gt:started-at": "2023-06-07", it has to be 3 months ago calculated and formated like the string

          ":gt:started-at": new Date(
            new Date().setMonth(new Date().getMonth() - 3)
          )
            .toISOString()
            .split("T")[0],
          ":has:governing-body": true,
          "governing-body": {
            ":has:administrative-unit": true,
            "administrative-unit": {
              ":has:name": true,
            },
          },
        },
      },
    };

    const agendaData = await this.store
      .query("agenda-item", req)
      .then((data) => {
        return data.filter((item) => {
          return item.session?.get("governingBody")?.get("administrativeUnit")
            ?.name;
        });
      });

    return {
      locationData: locationData,
      agendaData: agendaData,
    };
  }
}
