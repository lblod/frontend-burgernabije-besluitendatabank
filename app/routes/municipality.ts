import Route from "@ember/routing/route";

export default class MunicipalityRoute extends Route {
  model(params: any) {
    const { municipality } = params;
    return municipality;
  }
}
