import Model, { attr } from "@ember-data/model";
import DS from "ember-data";

export default class ItemsModel extends Model {
  @attr("string") declare title: string;
  @attr("string") declare body: string;
  @attr("date") declare approveddate: Date;
  @attr("date") declare startdate: Date;
  @attr("date") declare enddate: Date;
  @attr("string") declare municipality: string;
}

// export default DS.Model.extend({
//   data: DS.attr(),
// });
