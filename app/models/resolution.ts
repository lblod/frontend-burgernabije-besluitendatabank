import Model, { attr } from '@ember-data/model';

export default class ResolutionModel extends Model {
  @attr('string') declare title?: string;
}
