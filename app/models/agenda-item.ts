import Model, { attr, belongsTo } from "@ember-data/model";
import SessionsModel from "./session";

export default class AgendaItemsModel extends Model {
  @attr("string") declare title: string;
  @attr("string") declare description: string;
  @attr("string") declare alternateLink: string;
  @attr("boolean") declare plannedforpublic : boolean;

  @belongsTo("session") declare session : SessionsModel;
}

