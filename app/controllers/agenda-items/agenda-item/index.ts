import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import AgendaItemRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items/agenda-item';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import { ModelFrom } from '../../../lib/type-utils';

export default class AgendaItemController extends Controller {
  @service declare keywordStore: KeywordStoreService;
  declare model: ModelFrom<AgendaItemRoute>;

  /** Data quality modal */
  @tracked modalOpen = false;

  get hasArticles() {
    return !!this.model.articles?.length;
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
