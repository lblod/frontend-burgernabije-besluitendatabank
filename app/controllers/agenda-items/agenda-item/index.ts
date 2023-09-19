import Controller from '@ember/controller';
import { service } from '@ember/service';
import { ModelFrom } from 'frontend-burgernabije-besluitendatabank/lib/type-utils';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import AgendaItemRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item';

export default class AgendaItemController extends Controller {
  @service declare keywordStore: KeywordStoreService;
  declare model: ModelFrom<AgendaItemRoute>;

  get hasVotes() {
    return !!this.model.vote;
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
