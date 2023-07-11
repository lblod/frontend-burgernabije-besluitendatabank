import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import SessionModel from './session';
import AdministrativeUnitModel from './administrative-unit';

export default class GoverningBodyModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende naam' }) declare name: string;

  @belongsTo('administrative-unit', {
    async: false,
    inverse: 'governingBodies',
  })
  declare administrativeUnit: AdministrativeUnitModel;

  @belongsTo('session', { async: true, inverse: 'governingBody' })
  declare session: AsyncBelongsTo<SessionModel>;
}
