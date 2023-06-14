import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import AuthSessionService from "frontend-burgernabije-besluitendatabank/services/auth-session";

export default class MockLoginRoute extends Route {
  @service declare authSession: AuthSessionService;
  @service declare store: Store;

  queryParams = {
    page: {
      refreshModel: true,
    },
  };

  beforeModel() {
    this.authSession.prohibitAuthentication("home");
  }

  model(params: any) {
    const filter: any = {
      provider: "https://github.com/lblod/mock-login-service",
    };
    if (params.gemeente)
      filter.gebruiker = { bestuurseenheden: params.gemeente };
    return this.store.query("account", {
      include: "user.governingBody",
      filter: filter,
      page: { size: 10, number: params.page },
      sort: "user.surname",
    });
  }
}
