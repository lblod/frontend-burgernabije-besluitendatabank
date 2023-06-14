import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
// <reference path"../types/ember-simple-auth/services/session.d.ts" />
import { action } from "@ember/object";
import SessionService from "ember-simple-auth/services/session";
import CurrentAuthSessionService from "./current-auth-session";

export default class AuthSessionService extends SessionService {
  @service declare currentAuthSession: CurrentAuthSessionService;
  @tracked isAuthenticated = false;
  @tracked data: any;
  get isMockLoginSession() {
    return this.isAuthenticated
      ? this.data.authenticated.authenticator.includes("mockLogin")
      : false;
  }

  @action prohibitAuthentication(route: string) {
    return true;
  }

  async handleAuthentication(routeAfterAuthentication: any) {
    await this.currentAuthSession.load();
    super.handleAuthentication(routeAfterAuthentication);
  }

  handleInvalidation() {}
}
