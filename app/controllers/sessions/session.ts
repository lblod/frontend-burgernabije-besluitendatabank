import Controller from '@ember/controller';
import { ModelFrom } from '../../lib/type-utils';
import SessionSessionRoute from '../../routes/sessions/session';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';

export default class SessionsSessionController extends Controller {
  /** Used to fetch agenda items from the model */
  declare model: ModelFrom<SessionSessionRoute>;

  get agendaItemsSorted() {
    let agendaItems = this.model.hasMany('agendaItems').value() as
      | AgendaItem[]
      | null;

    if (!agendaItems) {
      agendaItems = [];
    }

    return agendaItems
      .slice()
      .filter(({ title }) => !!title)
      .sort(sortObjectsByTitle);
  }
}
