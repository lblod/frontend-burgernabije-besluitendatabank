import Model, { attr, belongsTo } from "@ember-data/model";

export default class AgendaItemsModel extends Model {
  @attr("string") declare title: string;
  @attr("string") declare alternateLink: string;
  @attr("boolean") declare plannedforpublic : boolean;

  @belongsTo("session") session;
}

