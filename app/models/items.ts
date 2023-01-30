import Model, { attr } from "@ember-data/model";

export default class ItemsModel extends Model {
  @attr("string") declare title?: string;
  @attr("string") declare body?: string;
  @attr("date") declare approvedDate?: Date;
  @attr("date") declare startDate?: Date;
  @attr("date") declare endDate?: Date;
  @attr("string") declare municipality?: string;
}
