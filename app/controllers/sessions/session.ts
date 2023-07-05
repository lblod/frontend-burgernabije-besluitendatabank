import Controller from "@ember/controller";
import {computed} from "@ember/object";
import { ModelFrom } from '../../lib/type-utils';
import SessionSessionRoute from '../../routes/sessions/session';

export default class SessionsSessionController extends Controller {
    /** Used to fetch agenda items from the model */
    declare model: ModelFrom<SessionSessionRoute>;

    @computed('model.agendaItems')
    get agendaItemsSorted() {
        return this.model.agendaItems.toArray().sort((a, b) => {
            return a.title.localeCompare(b.title, undefined, { numeric: true });
        });
    }
}
