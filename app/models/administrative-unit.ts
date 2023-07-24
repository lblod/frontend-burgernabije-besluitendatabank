import Model, {
  attr,
  belongsTo,
  hasMany,
  AsyncHasMany,
  AsyncBelongsTo,
} from '@ember-data/model';
import GoverningBodyModel from './governing-body';
import AdministrativeUnitClasssificationCodeModel from './location';
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

  @belongsTo('location', { async: false, inverse: null })
  declare location: LocationModel;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'administrative-unit': AdministrativeUnitModel;
  }
}
