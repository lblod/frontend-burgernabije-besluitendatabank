import EmberRouter from "@ember/routing/router";
import config from "frontend-burgernabije-besluitendatabank/config/environment";

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  console.log(config);
  this.route("detail", { path: "/agendapunt/:id" });
  this.route("municipality", { path: "/municipality/:municipality" });
  this.route("help", { path: "/help" });
  this.route("home", { path: "/" }, function (req, res) {
    this.route("list", { path: "/" });
    this.route("map", { path: "/kaart" });
  });
});
