import Model, { attr } from "@ember-data/model";

export default class ResolutionModel extends Model {
  @attr("string") declare title?: string;
  //   @attr("string") declare description?: string;
  //   @attr("date") declare publicationDate?: Date;

  //   @belongsTo("agenda-item-handling")
  //   declare handledBy?: AgendaItemHandlingModel;
}
