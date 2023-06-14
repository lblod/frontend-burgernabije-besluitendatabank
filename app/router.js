import EmberRouter from "@ember/routing/router";
import config from "frontend-burgernabije-besluitendatabank/config/environment";

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route("detail", { path: "/agendapunt/:id" });
  this.route("municipality", { path: "/gemeente/:municipality" });
  this.route("help", { path: "/help" });
  this.route("home", { path: "/" }, function (req, res) {
    this.route("list", { path: "/" });
    this.route("map", { path: "/kaart" });
  });
  this.route("sessions", { path: "/zittingen" }, function () {
    this.route("session", { path: "/:session_id" });
  });
  this.route("FourOhFour", { path: "/*path" });

  this.route('auth', function() {
    this.route('login');
    this.route('logoutError');
    this.route('logoutLoading');
    this.route('callbackError');
    this.route('callbackLoading');
    this.route('switch');
  });
  this.route('mockLogin');
});
