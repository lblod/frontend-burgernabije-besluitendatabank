import Model, { belongsTo } from '@ember-data/model';
import parliamentaryGroupModel from './parliamentary-group';

export default class MembershipModel extends Model {
  @belongsTo('parliamentary-group', { async: true, inverse: null })
  declare innerGroup: parliamentaryGroupModel;
}
