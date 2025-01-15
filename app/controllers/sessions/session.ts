import Controller from '@ember/controller';
import type { ModelFrom } from '../../lib/type-utils';
import type SessionSessionRoute from '../../routes/sessions/session';
import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';

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
      .filter(({ titleFormatted }) => !!titleFormatted)
      .sort((a, b) =>
        a.titleFormatted.localeCompare(b.titleFormatted, undefined, {
          numeric: true,
        }),
      );
  }
}
