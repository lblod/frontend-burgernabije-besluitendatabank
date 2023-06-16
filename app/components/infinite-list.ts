import Component from "@glimmer/component";
import { action } from "@ember/object";
import { throttle } from '@ember/runloop';

interface ArgsInterface {
    loadMore: () => void;
    isLoading: boolean;
}

export default class InfiniteList extends Component<ArgsInterface> {
    @action
    scroll(event: any) {
        throttle(this, this._onScroll, event, 500, false);
    }

    _onScroll(event: Event) {
        const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement;
        const scrollTopMax = scrollHeight - clientHeight;
        const scrollPercentage = scrollTop / scrollTopMax;

        // trigger loadMore when >80% is scrolled
        if (scrollPercentage > .8) {
            this.loadMore();
        }
    }

    @action
    loadMore() {
        this.args.loadMore();
    }
}
