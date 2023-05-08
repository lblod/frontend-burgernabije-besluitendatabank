import Model, { attr, belongsTo } from '@ember-data/model';

export default class SessionsModel extends Model {
    @attr("date") declare startedAt: Date;
    @attr("date") declare endedAt: Date;

    @belongsTo("agenda-item") agendaItem;
    @belongsTo("governing-agent") governingAgent;
}
