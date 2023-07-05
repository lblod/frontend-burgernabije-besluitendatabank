import Controller from "@ember/controller";
import {computed} from "@ember/object";
import { ModelFrom } from '../../lib/type-utils';
import SessionSessionRoute from '../../routes/sessions/session';
import { sortObjectsByTitle } from "frontend-burgernabije-besluitendatabank/utils/array-utils";

export default class SessionsSessionController extends Controller {
    declare model: ModelFrom<SessionSessionRoute>;

    @computed('model.agendaItems')
    get agendaItemsSorted() {
        return this.model.agendaItems.toArray().sort(sortObjectsByTitle);
    }
}
