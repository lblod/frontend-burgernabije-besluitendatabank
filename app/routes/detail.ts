import Route from "@ember/routing/route";

export default class DetailRoute extends Route {
  model(params: any) {
    const { id } = params;
    console.log("Agendapunt nummber: " + id);
    return id;
  }
}
