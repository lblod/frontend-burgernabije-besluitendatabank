import Component from "@glimmer/component";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tr } from "date-fns/locale";

interface Link {
    route: string;
    label: string;
}

export default class NavigationBar extends Component {
    @service declare router: RouterService;

    links: Array<Link> = [
        {
            route: "home.list",
            label: "Agendapunten",
        },
        {
            route: "home.map",
            label: "Kaart",
        },
        {
            route: "sessions",
            label: "Zittingen",
        },
    ];
}
