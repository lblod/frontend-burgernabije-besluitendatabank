import Model, { attr, belongsTo } from '@ember-data/model';
import SessionsModel from './session';

export default class GoverningAgentModel extends Model {
    @attr("string") declare label: string;

    @belongsTo("session") declare session: SessionsModel;
}
