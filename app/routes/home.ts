import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import { getMunicipalitiesFromVlaanderen } from "frontend-burgernabije-besluitendatabank/utils/apivlaanderen";
export default class HomeRoute extends Route {
  @service declare store: Store;

  async model(params: any) {
    const municipalities = await getMunicipalitiesFromVlaanderen(true);
    return municipalities;
  }
}
