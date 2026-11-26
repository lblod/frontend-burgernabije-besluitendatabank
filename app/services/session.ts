import SessionService from 'ember-simple-auth/services/session';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

type SessionRelationships = {
  account?: { data?: { id: string } };
  group?: { data?: { id: string } };
};

// What the login service (ACM/IDM or mock) returns for a session.
export type AuthenticatedData = {
  authenticator: string;
  data?: {
    id: string;
    attributes?: { roles?: string[] };
    relationships?: SessionRelationships;
  };
  // The mock login puts the relationships next to data, ACM/IDM inside it.
  relationships?: SessionRelationships;
};

type Data = { authenticated: AuthenticatedData };

export default class AppSessionService extends SessionService<Data> {
  @service declare router: RouterService;

  get isMockLoginSession(): boolean {
    return (
      this.isAuthenticated &&
      this.data.authenticated.authenticator === 'authenticator:mock-login'
    );
  }

  handleAuthentication(): void {
    // What the user may read changes with the session: reload the app so it starts from a clean store.
    window.location.replace(this.router.urlFor('home'));
  }

  handleInvalidation(): void {
    // The auth.logout route redirects after logging out, depending on how the user logged in.
  }
}

declare module '@ember/service' {
  interface Registry {
    session: AppSessionService;
  }
}
