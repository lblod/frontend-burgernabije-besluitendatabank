import Controller from '@ember/controller';
import { service } from '@ember/service';
import { ModelFrom } from '../../lib/type-utils';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import AgendaItemRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item';

export default class AgendaItemController extends Controller {
  @service declare keywordStore: KeywordStoreService;
  declare model: ModelFrom<AgendaItemRoute>;

  get hasVotes() {
    return !!this.model.vote;
  }

  get municipalityQuery() {
    return { gemeentes: this.model.agendaItem.session?.municipality };
  }
}
