import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';

interface Link {
  route: string;
  label: string;
}

export default class NavigationBar extends Component {
  @service declare router: RouterService;

  links: Array<Link> = [
    {
      route: 'home',
      label: 'Home',
    },
    {
      route: 'sessions',
      label: 'Zittingen',
    },
  ];
}
