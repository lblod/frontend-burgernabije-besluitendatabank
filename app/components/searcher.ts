import Component from "@glimmer/component";
import { action } from "@ember/object";
import Store from "@ember-data/store";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import RouterService from "@ember/routing/router-service";
import { Filter, TextFilter, SelectFilter, DateRangeFilter } from "frontend-burgernabije-besluitendatabank/utils/Filter";

interface ArgsInterface {
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
    if (filter && filter.value) {
      req["filter"] = {... req["filter"], ...filter.filter(filter.value)};
    }
  }

  console.log(req);

  return req;
}

export default class SearchSidebar extends Component<ArgsInterface> {
  offset = 10;
  @service declare store: Store;
  @service declare inViewport: any;
  @service declare router: RouterService;


  // Data code
  @tracked values: any;

  get filters(): Array<Filter> {
    return this.args.filters;
  }
  
  queryParamHasFilter(queryParamName: string) : boolean {
    let index = this.filters.findIndex((filter => filter.queryParam == queryParamName || filter.queryParams?.includes(queryParamName)));
    return index > -1;
  }

  getFilterFromQueryParam(queryParamName: string): Filter {
    let filter = this.filters.find((filter => filter.queryParam == queryParamName || filter.queryParams?.includes(queryParamName)));
    if (!filter) {
      throw Error("filter with attribute " + queryParamName + " not found");
    }
    else {
      return filter;
    }
  }

  @action
  async selectChange() {

  }

  @action
  async dateChange(filter: DateRangeFilter, e: any, start: string, end: string) {
    filter.start = start;
    filter.end = end;

    if (filter.queryParams) {
      let queryParams: {[key:string]: string} = {};
      let startParam = filter.queryParams[0];
      let endParam = filter.queryParams[1];

      if (startParam) {
        queryParams[startParam] = filter.start;
      }
      if (endParam) {
        queryParams[endParam] = filter.end;
      }

      this.router.transitionTo(this.router.currentRouteName, {
        queryParams: queryParams
      });
    }

    this.request();
  }

  @action
  async filterChange(filter: TextFilter, e: Event) {
    console.log(...arguments)

    if (e.target) {
      filter.value = (e.target as HTMLInputElement).value;
      if (filter.queryParam) {
        this.router.transitionTo(this.router.currentRouteName, {
          queryParams: {
            [filter.queryParam]: filter.value,
          },
        });
      }

    }

    this.request();
    //prepareRequest(this.offset, this.args.includes, this.filters);
  }

  @action
  onLoad() {
    // Load in queryParams
    let queryParams = this.router.currentRoute.queryParams;
    let queryParamKeys = Object.keys(queryParams);
    for (let i = 0; i < queryParamKeys.length; i++) {
      let key = queryParamKeys[i];
      if (key) {
        let value = queryParams[key];
        console.log(key);
        console.log(this.queryParamHasFilter(key))

        
        if (this.queryParamHasFilter(key)) {
          console.log(this.getFilterFromQueryParam(key))
          this.getFilterFromQueryParam(key).value = value;
          console.log("meow" + value);
        }
      }
    }

    //this.getFilter("keyword").value = "Meow";
    this.request();

  }

  async request() {
    let values = await this.store.query(this.args.queryModel, prepareRequest(this.offset, this.args.includes, this.filters));
    this.values = values;
  }






  // Infinity scroll code
  @action
  setupInViewport() {
    const loader = document.getElementById("loader");
    console.log(loader)
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
    this.offset += 10;
    
    this.router.transitionTo(this.router.currentRouteName, {
      queryParams: {
        offset: this.offset,
      },
    });
    
  }

}
