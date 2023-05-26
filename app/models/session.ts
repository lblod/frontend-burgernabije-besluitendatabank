import Model, { attr, belongsTo } from '@ember-data/model';
import AgendaItemModel from './agenda-item';
import GoverningBodyModel from './governing-body';

export default class SessionsModel extends Model {
    @attr("date") declare startedAt: Date;
    @attr("date") declare endedAt: Date;

    @belongsTo("agenda-item") declare agendaItem: AgendaItemModel;
    @belongsTo("governing-body") declare governingAgent : GoverningBodyModel;
}
