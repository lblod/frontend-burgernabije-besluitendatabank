import Component from "@glimmer/component";
import { action } from "@ember/object";
import Store from "@ember-data/store";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import RouterService from "@ember/routing/router-service";


interface ArgsInterface {
  includes: Array<string>;
  queryModel: string;
  filters: Array<any>;
}

export default class SearchSidebar extends Component<ArgsInterface> {
  offset = 10;
  @service declare store: Store;
  @service declare inViewport: any;
  @service declare router: RouterService;


  // Data code
  @tracked values: any;

  _filter: {[key:string]: any} = {};

  get filters(): Array<any> {  // TODO change to IFilter
    return this.args.filters;
  }
  

  @action
  onLoad() {
    // Load in queryParams
    /*
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

    this.request();
    */
   //this.request();

  }

  @action
  update() {
    this.request();
  }

  @action
  updateFilter(obj: object) {
    console.log("meo")
    console.log(obj)
    console.log(this._filter)
    this._filter = {... this._filter, ...obj};
    this.request();
  }

  async request() {
    let req: {[key: string]: any} = {
      page: {
        size: this.offset,
      },
      include: this.args.includes.join(","),
      filter: this._filter,
    };
  
    console.log(req);

    let values = await this.store.query(this.args.queryModel, req);
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
