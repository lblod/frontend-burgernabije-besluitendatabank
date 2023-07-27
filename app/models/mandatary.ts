import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import MembershipModel from './membership';
import PersonModel from './person';

export default class MandataryModel extends Model {
  @attr('date') declare startDate: Date;
  @attr('date') declare endDate: Date;

  @belongsTo('person', { async: true, inverse: null })
  declare alias: AsyncBelongsTo<PersonModel>;

  get aliasValue() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    return (this as MandataryModel)
      .belongsTo('alias')
      ?.value() as PersonModel | null;
  }

  @belongsTo('membership', { async: true, inverse: null })
  declare hasMembership: AsyncBelongsTo<MembershipModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    mandatary: MandataryModel;
  }
}
