import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type UserModel from './user';

export default class AccountModel extends Model {
  @attr('string') declare provider?: string;
  @attr('string') declare role?: string;
  @attr('string') declare mockLoginGroupId?: string;

  @belongsTo('user', { async: true, inverse: 'accounts' })
  declare user: AsyncBelongsTo<UserModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    account: AccountModel;
  }
}
