import Component from "@glimmer/component";
import { action } from "@ember/object";
import Store from "@ember-data/store";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";

interface Filter {
  attribute: string,
  name: string,
  placeholder: string,
  type: string,
  options: [],
  onChange: (value: any) => any,
  value: any,
  filter: any
}

interface ArgsInterface {
  municipalityPlaceholder: string;
  municipalitySelected: string;
  municipalityOnChange: () => void;
  municipalityOptions: Array<any>;
  municipalityAllowClear: boolean;

  keywordPlaceholder: string;
  keywordOnChange: string;

  applyDatePicker: () => any;
  hideDatePicker: () => any;
  cancelDatePicker: () => any;
  startDate: any;
  endDate: any;

  includes: Array<string>;
  queryModel: string;
  filters: Array<Filter>;
}

function prepareRequest(offset: number, includes: Array<String>, filters: Array<Filter>) {
  let req: {[key: string]: any} = {
    page: {
      size: offset,
    },
    include: includes.join(","),
    filter: {},
  };

  // Had to assign it here for typescript rr
  req["filter"] = {};

  for (let i = 0; i < filters.length; i++) {
    let filter = filters[i];
    if (filter) {
      //req["filter"] = {... req["filter"], ...filter.filter(filter.value)};
    }
  }

  console.log(req);

  return req;
}

export default class SearchSidebar extends Component<ArgsInterface> {
  offset = 100;
  @service declare store: Store;
  @service declare inViewport: any;

  @tracked values: any;

  get filters(): Array<Filter> {
    return this.args.filters;
  }

  @action
  async filterChange(filter: Filter, e: Event) {
    console.log(e)
    console.log(filter);

    if (e.target) {
      filter.value = (e.target as HTMLInputElement).value;
      //filter.onChange(filter.value);

    }

    this.request();
    //prepareRequest(this.offset, this.args.includes, this.filters);
  }


  async request() {
    console.log(prepareRequest(this.offset, this.args.includes, this.filters));
    let values = await this.store.query(this.args.queryModel, prepareRequest(this.offset, this.args.includes, this.filters));
    this.values = values;
  }






  @action
  setupInViewport() {
    const loader = document.getElementById("loader");
    const viewportTolerance = { bottom: 200 };
    const { onEnter, _onExit } = this.inViewport.watchElement(loader, {
      viewportTolerance,
    });
    // pass the bound method to `onEnter` or `onExit`
    onEnter(this.didEnterViewport.bind(this));
  }

  didEnterViewport() {
    this.infinityLoad();
  }

  @action infinityLoad() {
    this.offset += 100;
    /*
    this.router.transitionTo("home", {
      queryParams: {
        offset: this.offset,
      },
    });
    */
  }

}
