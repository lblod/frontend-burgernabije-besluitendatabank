import Model, { attr, belongsTo } from '@ember-data/model';
import AgendaItemsModel from './agenda-item';
import GoverningAgentModel from './governing-agent';

export default class SessionsModel extends Model {
    @attr("date") declare startedAt: Date;
    @attr("date") declare endedAt: Date;

    @belongsTo("agenda-item") declare agendaItem: AgendaItemsModel;
    @belongsTo("governing-agent") declare governingAgent : GoverningAgentModel;
}
