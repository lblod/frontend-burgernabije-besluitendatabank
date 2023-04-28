import Model, { belongsTo } from '@ember-data/model';

export default class IsGehoudenDoorModel extends Model {

    @belongsTo("session") session;
}
