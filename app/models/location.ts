import Model, { attr } from '@ember-data/model';

export default class LocationModel extends Model {
    @attr("string") declare label: string;
    @attr("string") declare niveau: string;
}
