import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';
import AdministrativeUnitClasssificationCodeModel from './administrative-unit-classification-code';
import GoverningBodyModel from './governing-body';
import LocationModel from './location';

export default class AdministrativeUnitModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende gemeente' })
  declare name: string;

  @hasMany('governing-body', { async: true, inverse: 'administrativeUnit' })
  declare governingBodies: AsyncHasMany<GoverningBodyModel>;

  @belongsTo('administrative-unit-classification-code', {
    async: true,
    inverse: null,
  })
  declare classification: AsyncBelongsTo<AdministrativeUnitClasssificationCodeModel>;

  @belongsTo('location', { async: true, inverse: null })
  declare location: AsyncBelongsTo<LocationModel>;

  get locationValue() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    return (this as AdministrativeUnitModel)
      .belongsTo('location')
      ?.value() as LocationModel | null;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'administrative-unit': AdministrativeUnitModel;
  }
}
