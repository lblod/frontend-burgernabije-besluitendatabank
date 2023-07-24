import Model, { AsyncBelongsTo, belongsTo } from '@ember-data/model';
import ParliamentaryGroupModel from './parliamentary-group';

export default class MembershipModel extends Model {
  @belongsTo('parliamentary-group', { async: true, inverse: null })
  declare innerGroup: AsyncBelongsTo<ParliamentaryGroupModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    membership: MembershipModel;
  }
}
