import Model, { attr } from '@ember-data/model';

export default class ExcerptModel extends Model {
  @attr alternateLink?: string;
}
