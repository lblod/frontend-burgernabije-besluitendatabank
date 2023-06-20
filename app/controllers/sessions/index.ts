import Controller from "@ember/controller";
import Store from "@ember-data/store";
import { action } from "@ember/object";
import { ModelFrom } from '../../lib/type-utils';
import SessionIndexRoute from '../../routes/sessions/index';
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";

export default class SessionsIndexController extends Controller {
    declare model: ModelFrom<SessionIndexRoute>;
    @service declare store: Store;
    @tracked isLoadingMore = false;

    @action
    async loadMore() {
        //todo add max page guard
        if (this.model && !this.isLoadingMore) {
            this.isLoadingMore = true;
            const nextPage = this.model.currentPage + 1;

            const sessions = await this.store.query("session", this.model.getQuery(nextPage));
            const concatenateSessions = this.model.sessions.concat(sessions.toArray());
            this.model.sessions.setObjects(concatenateSessions);

            this.model.currentPage = nextPage;
            this.isLoadingMore = false;
        }
    }
}
