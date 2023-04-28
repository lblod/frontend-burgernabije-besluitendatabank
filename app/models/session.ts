import Model, { attr, belongsTo } from '@ember-data/model';

export default class SessionsModel extends Model {
    @attr("date") declare startedAt: string;
    @attr("date") declare endedAt: string;

    @belongsTo("agenda-item") agendaItem;
    @belongsTo("is-gehouden-door") isGehoudenDoor;
}
