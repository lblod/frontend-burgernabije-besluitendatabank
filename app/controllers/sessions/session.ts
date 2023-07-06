import Controller from '@ember/controller';
import { ModelFrom } from '../../lib/type-utils';
import SessionSessionRoute from '../../routes/sessions/session';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';

export default class SessionsSessionController extends Controller {
  declare model: ModelFrom<SessionSessionRoute>;

  get agendaItemsSorted() {
    return this.model.agendaItems.toArray().sort(sortObjectsByTitle);
  }
}
