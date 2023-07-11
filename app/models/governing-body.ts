import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import SessionModel from './session';
import AdministrativeUnitModel from './administrative-unit';

export default class GoverningBodyModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende naam' }) declare name: string;

  @belongsTo('administrative-unit', { async: false })
  declare administrativeUnit: AdministrativeUnitModel;
  @belongsTo('session') declare session: AsyncBelongsTo<SessionModel>;
}
