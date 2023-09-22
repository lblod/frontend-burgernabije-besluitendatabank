import Controller from '@ember/controller';
import { ModelFrom } from '../../../lib/type-utils';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';
import AgendaItemsAgendaItemSessionRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item/session';

export default class AgendaItemsAgendaItemSessionController extends Controller {
  /** Used to fetch agenda items from the model */
  declare model: ModelFrom<AgendaItemsAgendaItemSessionRoute>;

  get agendaItemsSorted() {
    return this.model.agendaItemOnSameSession
      ?.concat(this.model.agendaItem)
      .slice()
      .sort(sortObjectsByTitle);
  }
}
