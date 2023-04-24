import Model, { attr } from "@ember-data/model";
import DS from "ember-data";

export default class ItemsModel extends Model {
  @attr("string") declare title: string;
  @attr("string") declare alternateLink: string;
  @attr("boolean") declare plannedForPublic : boolean;
}

// export default DS.Model.extend({
//   data: DS.attr(),
// });
