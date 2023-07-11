import Component from '@glimmer/component';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';

interface ArgsInterface {
  route: string;
}

export default class NavigationBar extends Component<ArgsInterface> {
  @service declare router: RouterService;

  get isActive() {
    return this.router.currentRouteName.indexOf(this.args.route) !== -1;
  }
}
