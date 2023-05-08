import Model, { attr, belongsTo } from '@ember-data/model';

export default class GoverningAgentModel extends Model {
    @attr("string") declare label: string;

    @belongsTo("session") session;
}
