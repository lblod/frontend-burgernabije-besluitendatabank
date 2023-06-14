import Route from "@ember/routing/route";
import Router from "@ember/routing/router";
import { inject as service } from "@ember/service";
import ENV from "frontend-burgernabije-besluitendatabank/config/environment";
import AuthSessionService from "frontend-burgernabije-besluitendatabank/services/auth-session";

export default class AuthLoginRoute extends Route {
  @service declare router: Router;
  @service declare authSession: AuthSessionService;

  beforeModel() {
    if (this.authSession.prohibitAuthentication("home")) {
      console.log("hello??");
      if (isValidAcmidmConfig(ENV.acmidm)) {
        window.location.replace(buildLoginUrl(ENV.acmidm));
      } else {
        this.router.transitionTo("mockLogin");
      }
    }
  }
}

function buildLoginUrl({
  authUrl,
  clientId,
  authRedirectUrl,
  scope,
}: {
  authUrl: string;
  clientId: string;
  authRedirectUrl: string;
  scope: string;
}) {
  let loginUrl = new URL(authUrl);
  let searchParams = loginUrl.searchParams;

  searchParams.append("response_type", "code");
  searchParams.append("client_id", clientId);
  searchParams.append("redirect_uri", authRedirectUrl);
  searchParams.append("scope", scope);

  return loginUrl.href;
}

function isValidAcmidmConfig(acmidmConfig: any) {
  return Object.values(acmidmConfig).every(
    (value) =>
      typeof value === "string" &&
      value.trim() !== "" &&
      !value.startsWith("{{")
  );
}
