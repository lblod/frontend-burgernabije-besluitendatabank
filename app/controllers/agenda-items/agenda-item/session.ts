import Controller from '@ember/controller';
import { ModelFrom } from 'frontend-burgernabije-besluitendatabank/lib/type-utils';
import AgendaItemsAgendaItemSessionRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item/session';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';

export default class AgendaItemsAgendaItemSessionController extends Controller {
  /** Used to fetch agenda items from the model */
  declare model: ModelFrom<AgendaItemsAgendaItemSessionRoute>;

  get agendaItemsSorted() {
    let agendaItems = [this.model.agendaItem].concat(
      this.model.agendaItemOnSameSession
    );

    if (!agendaItems) {
      agendaItems = [];
    }

    return agendaItems.slice().sort(sortObjectsByTitle);
  }
}
