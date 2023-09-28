import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { ModelFrom } from '../../../lib/type-utils';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import AgendaItemRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item';

export default class AgendaItemController extends Controller {
  @service declare keywordStore: KeywordStoreService;
  declare model: ModelFrom<AgendaItemRoute>;

  /** Data quality modal */
  @tracked modalOpen = false;

  get hasArticles() {
    return !!this.model.articles?.length;
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

  showModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    if (this.modalOpen) {
      this.modalOpen = false;
    }
  };
}
