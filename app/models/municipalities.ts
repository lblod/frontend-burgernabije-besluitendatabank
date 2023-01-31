import Model, { attr } from "@ember-data/model";

export default class MunicipalitiesModel extends Model {
  @attr("string") declare title: string;
  @attr("string") declare email: string;
  @attr("string") declare phonenumber: string;
  @attr("string") declare website: string;
}
