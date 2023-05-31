import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import HomeRoute from "../home";


export default class ListRoute extends Route {
  @service declare store: Store;

  
  offset = 10;
  

  async model(params: any) {
    //let model : any = this.paramsFor("home");
    

    
    //let agendaItems = await this.store.query("agenda-item", model.queryParams);

    //return agendaItems;
  }
}
