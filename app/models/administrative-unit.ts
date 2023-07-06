import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import GoverningBodyModel from './governing-body';
import AdministrativeUnitClasssificationCodeModel from './location';
import LocationModel from './location';

export default class AdministrativeUnitModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende gemeente' })
  declare name: string;

  @hasMany('governing-body') declare governingBodies: GoverningBodyModel;
  @belongsTo('administrative-unit-classification-code')
  declare classification: AdministrativeUnitClasssificationCodeModel;
  @belongsTo('location') declare location: LocationModel;
}
