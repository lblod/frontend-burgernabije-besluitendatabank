import Model, {
  attr,
  belongsTo,
  hasMany,
  AsyncHasMany,
} from '@ember-data/model';
import SessionModel from './session';
import AdministrativeUnitModel from './administrative-unit';

/**
 * There are two types of governing bodies
 *
 * 1. The abstraction (undated)
 * 2. With the time that they are active specified
 *
 * That time is called a timeSpecialisation (tijdspecialisatie),
 * which is defined {@link https://themis.vlaanderen.be/docs/catalogs here (see 2.2.2.2)}
 * as "the governing period where a *governing body*
 * is appointed through direct elections"
 *
 * You can view the mandatendatabank specification
 * on vlaanderen.be {@link https://data.vlaanderen.be/doc/applicatieprofiel/mandatendatabank here}
 *
 */
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
