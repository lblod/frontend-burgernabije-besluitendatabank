import Model, { attr, belongsTo } from '@ember-data/model';
import SessionModel from './session';
import AdministrativeUnitModel from './administrative-unit';

export default class GoverningBodyModel extends Model {
    @attr("string") declare name: string;

    @belongsTo("administrative-unit") declare administrativeUnit: AdministrativeUnitModel;
    @belongsTo("session") declare session: SessionModel;
}
