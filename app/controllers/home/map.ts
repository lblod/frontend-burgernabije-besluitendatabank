import Controller from "@ember/controller";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import municipalities from "../../utils/geoJson.json";
export default class Map extends Controller {
  @tracked geoData = municipalities;
  @action onLocationfound(e: any) {
    console.log(e);
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
