import Model, { attr } from '@ember-data/model';

export default class AdministrativeUnitClasssificationCodeModel extends Model {
    @attr("string") declare label: string;
}
