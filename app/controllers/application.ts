import Controller from '@ember/controller';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service declare router: RouterService;

  VO_HEADER_WIDGET_URL =
    'https://tni.widgets.burgerprofiel.dev-vlaanderen.be/api/v1/widget/7eed3599-96aa-435b-bc43-fe13d2fc0531';
  VO_FOOTER_WIDGET_URL =
    'https://tni.widgets.burgerprofiel.dev-vlaanderen.be/api/v1/widget/7eed3599-96aa-435b-bc43-fe13d2fc0531';

  get hasExternallySourcedHeader() {
    try {
      new URL(
        'https://tni.widgets.burgerprofiel.dev-vlaanderen.be/api/v1/widget/7eed3599-96aa-435b-bc43-fe13d2fc0531'
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  get hasExternallySourcedFooter() {
    try {
      new URL(
        'https://tni.widgets.burgerprofiel.dev-vlaanderen.be/api/v1/widget/7eed3599-96aa-435b-bc43-fe13d2fc0531'
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  get isIndex() {
    return this.router.currentRouteName === 'home';
  }
}
