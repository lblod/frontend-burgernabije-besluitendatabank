import Controller from "@ember/controller";
import Store from "@ember-data/store";
import { action } from "@ember/object";
import { ModelFrom } from '../../lib/type-utils';
import SessionIndexRoute from '../../routes/sessions/index';
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import MunicipalityListService from "frontend-burgernabije-besluitendatabank/services/municipality-list";
import { get } from "@ember/object";
export default class SessionsIndexController extends Controller {
    declare model: ModelFrom<SessionIndexRoute>;
    @service declare store: Store;
    @tracked isLoadingMore = false;
    @service declare municipalityList: MunicipalityListService;

    get municipalities() {
        return this.municipalityList.municipalities();
    }

    @action
    async loadMore() {
        //todo add max page guard
        let moreDataToLoad = true;

        if (this.model && !this.isLoadingMore) {
            this.isLoadingMore = true;
            const nextPage = this.model.currentPage + 1;

            let plannedStartMin = String(get(this, "plannedStartMin")) || undefined;
            let plannedStartMax = String(get(this, "plannedStartMax")) || undefined;
            let municipalities = String(get(this, "municipality")) || undefined;

            const sessions = await this.store.query(
                "session", 
                this.model.getQuery(
                    nextPage, 
                    plannedStartMin=plannedStartMin, 
                    plannedStartMax=plannedStartMax, 
                    municipalities=municipalities));
            const concatenateSessions = this.model.sessions.concat(sessions.toArray());

            const previousAmount = this.model.sessions.length; 
            this.model.sessions.setObjects(concatenateSessions);
            if (this.model.sessions.length === previousAmount) {
                moreDataToLoad = false;
            }

            this.model.currentPage = nextPage;
            this.isLoadingMore = false;
        }

        return moreDataToLoad;
    }

    get isEmpty() {
        console.log("isEmpty", this.model.sessions.length);
        return this.model.sessions.length === 0;
    }
}
