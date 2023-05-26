import Model, { attr, belongsTo } from '@ember-data/model';
import PersonModel from './person';

export default class MandataryModel extends Model {
    @attr("date") declare startDate: Date;
    @attr("date") declare endDate: Date;

    @belongsTo('person', { inverse: null }) declare alias:PersonModel;
}
