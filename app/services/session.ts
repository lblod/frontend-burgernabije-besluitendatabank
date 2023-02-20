import { inject as service } from "@ember/service";
import CurrentSessionService from "./current-session";
// import Base from "ember-simple-auth/session-stores/base"

// export default class SessionStore extends Base {
//   persist() {}
//   @service declare currentSession: CurrentSessionService;

//   handleAuthentication(routeAfterAuthentication: any) {
//     super.handleAuthentication(routeAfterAuthentication);
//     this.currentSession.load();
//   }

//   handleInvalidation() {
//     const logoutUrl = "";
//     super.handleInvalidation(logoutUrl);
//   }

//   restore() {}
// }
