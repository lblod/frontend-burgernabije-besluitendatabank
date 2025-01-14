import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

interface ArgsInterface {
  loadMore: () => void;
  isLoading: boolean;
  itemsShown: number;
  itemsAmount: number;
}

export default class InfiniteList extends Component<ArgsInterface> {
  @tracked isScrolling = false;

  @action
  scroll(event: Event) {
    if (!this.isScrolling) {
      this.isScrolling = true;
      requestAnimationFrame(() => {
        this._onScroll(event);
        this.isScrolling = false;
      });
    }
  }

  get moreDataToLoad() {
    return this.args.itemsShown < this.args.itemsAmount;
  }

  _onScroll(event: Event) {
    const { scrollTop, scrollHeight, clientHeight } =
      event.target as HTMLElement;
    const scrollTopMax = scrollHeight - clientHeight;
    const scrollPercentage = scrollTop / scrollTopMax;

    // trigger loadMore when >80% is scrolled
    if (scrollPercentage > 0.8) {
      this.loadMore();
    }
  }

  @action
  loadMore() {
    if (this.moreDataToLoad) {
      this.args.loadMore();
    }
  }
}
