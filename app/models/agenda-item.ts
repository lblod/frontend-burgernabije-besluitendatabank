import Model, { attr, belongsTo } from "@ember-data/model";
import SessionModel from "./session";
import AgendaItemHandlingModel from "./agenda-item-handling";

export default class AgendaItemModel extends Model {
  @attr("string", {defaultValue: "Ontbrekende titel"}) declare title: string;
  @attr("string") declare description: string;
  @attr("string") declare alternateLink: string;
  @attr("boolean") declare plannedPublic: boolean;

  @belongsTo("session") declare session?: SessionModel;
  @belongsTo("agenda-item-handling") declare handledBy?: AgendaItemHandlingModel;
}

