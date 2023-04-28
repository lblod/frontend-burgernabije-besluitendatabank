import Model, { attr, belongsTo } from "@ember-data/model";

export default class AgendaItemsModel extends Model {
  @attr("string") declare title: string;
  @attr alternateLink;
  @attr("boolean") declare plannedforpublic : boolean;

  @belongsTo("session") session;
}

