import Model, { attr } from '@ember-data/model';

export default class parliamentaryGroupModel extends Model {
  @attr('string') declare name: string;
}
