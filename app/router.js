import EmberRouter from "@ember/routing/router";
import config from "frontend-burgernabije-besluitendatabank/config/environment";

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route("home", { path: "/" });
  this.route("detail", { path: "/agendapunt/:id" });
  this.route("municipality", { path: "/municipality/:municipality" });
});
