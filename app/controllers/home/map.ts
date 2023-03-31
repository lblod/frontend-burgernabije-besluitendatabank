import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
// import { municipalities } from "../../utils/flandersMunicipalities";
export default class Map extends Controller {
  @service declare router: RouterService;

  @tracked geoData = {};

  @action handleLayerClick(e: any) {
    console.log(e.target.feature.properties.NAAM);
    this.router.transitionTo("municipality", e.target.feature.properties.NAAM);
  }
  save;

  @action onEachFeature(feature: any, layer: any) {
    layer.on("click", this.handleLayerClick);
  }
  @action style() {
    return {
      weight: 1,
      opacity: 0.8,
      color: "#0055CC",
      fillOpacity: 0.2,
    };
  }

  @tracked lng = 4.3;
  @tracked lat = 51;
  @tracked zoom = 9;
  @tracked location = [51, 4];
  @tracked view = true;
}
