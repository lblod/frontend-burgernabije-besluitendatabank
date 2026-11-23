import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type AccountModel from './account';
import type AdministrativeUnitModel from './administrative-unit';

export default class UserModel extends Model {
  @attr('string') declare firstName?: string;
  @attr('string') declare familyName?: string;

  @hasMany('account', { async: true, inverse: 'user' })
  declare accounts: AsyncHasMany<AccountModel>;

  @hasMany('administrative-unit', { async: true, inverse: null })
  declare groups: AsyncHasMany<AdministrativeUnitModel>;

  get fullName(): string {
    return [this.firstName, this.familyName].filter(Boolean).join(' ');
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    user: UserModel;
  }
}
