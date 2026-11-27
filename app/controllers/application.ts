import Controller from '@ember/controller';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';

/** Routes that fill the viewport themselves and leave no room for the footer */
const ROUTES_WITHOUT_FOOTER = ['validation-reports'];

export default class ApplicationController extends Controller {
  @service declare router: RouterService;

  get showFooter() {
    const routeName = this.router.currentRouteName;
    return !routeName || !ROUTES_WITHOUT_FOOTER.includes(routeName);
  }
}
