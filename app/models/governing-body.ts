import Model, {
  attr,
  belongsTo,
  hasMany,
  AsyncHasMany,
} from '@ember-data/model';
import SessionModel from './session';
import AdministrativeUnitModel from './administrative-unit';

export default class GoverningBodyModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende naam' }) declare name: string;

  @belongsTo('administrative-unit', {
    async: false,
    inverse: 'governingBodies',
  })
  declare administrativeUnit: AdministrativeUnitModel;

  @hasMany('session', { async: true, inverse: 'governingBody' })
  declare sessions: AsyncHasMany<SessionModel>;

  @belongsTo('governing-body', {
    async: false,
    inverse: 'hasTimeSpecializations',
  })
  declare isTimeSpecializationOf: GoverningBodyModel;

  @hasMany('governing-body', {
    async: true,
    inverse: 'isTimeSpecializationOf',
  })
  declare hasTimeSpecializations: AsyncHasMany<GoverningBodyModel>;
}
