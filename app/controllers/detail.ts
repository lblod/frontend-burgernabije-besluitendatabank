import Controller from '@ember/controller';
import { service } from '@ember/service';
import { ModelFrom } from '../lib/type-utils';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import DetailRoute from 'frontend-burgernabije-besluitendatabank/routes/detail';

export default class DetailController extends Controller {
  @service declare keywordStore: KeywordStoreService;
  declare model: ModelFrom<DetailRoute>;

  get hasVotes() {
    return !!this.model.vote;
  }

  get municipalityQuery() {
    return { gemeentes: this.model.agendaItem.session?.municipality };
  }
}
