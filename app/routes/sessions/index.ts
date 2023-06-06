import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";

export default class SessionsIndexRoute extends Route {
    @service declare store: Store;

    async model() {
        const sessions = await this.store.query("session", {
            // exclude sessions without governing body and administrative unit
            //todo investigate why filtering is not working
            filter: {
                ":has:governing-body": true,
                "governing-body": {
                    ":has:administrative-unit": true,
                },
            },
            include: [
                'governing-body.administrative-unit',
                'agenda-items',
            ].join(',')
        });

        return sessions;
    }
}
