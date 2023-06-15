import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import SessionModel from "frontend-burgernabije-besluitendatabank/models/session";


export default class SessionRoute extends Route {
  @service declare store: Store;

  async model({ session_id }: { session_id: string }) {
    // @ts-ignore
    const sessionFromParent: undefined | SessionModel = this.modelFor('sessions.index')?.sessions?.find((session: any) => session.id === session_id);
    const session: SessionModel = sessionFromParent ?? await this.store.findRecord("session", session_id, {
      include: [
        'governing-body.administrative-unit',
        'agenda-items',
      ].join(',')
    });

    return session;
  }
}
