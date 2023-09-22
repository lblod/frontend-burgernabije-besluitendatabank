import Controller from '@ember/controller';
import { service } from '@ember/service';
import { ModelFrom } from '../../../lib/type-utils';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import AgendaItemRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item';
import { sortObjectsByTitle } from 'frontend-burgernabije-besluitendatabank/utils/array-utils';

export default class AgendaItemController extends Controller {
  @service declare keywordStore: KeywordStoreService;
  declare model: ModelFrom<AgendaItemRoute>;

  get hasArticles() {
    return !!this.model.articles?.length;
  }

  get firstFourAgendaItems() {
    return this.model.agendaItemOnSameSession
      .filter((item) => item.id !== this.model.agendaItem.id)
      .sort(sortObjectsByTitle)
      .slice(0, 4);
  }

  get wasHandled() {
    return (
      Boolean(this.model.agendaItem?.session?.startedAt) ||
      Boolean(this.model.agendaItem?.session?.endedAt)
    );
  }

  get municipalityQuery() {
    return { gemeentes: this.model.agendaItem.session?.municipality };
  }
}
