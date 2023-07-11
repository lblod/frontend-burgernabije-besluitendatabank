import Model, { attr, hasMany } from '@ember-data/model';
import MandataryModel from './mandatary';

export default class VoteModel extends Model {
  @attr('number') declare numberOfAbstentions: number;
  @attr('number') declare numberOfOpponents: number;
  @attr('number') declare numberOfProponents: number;
  @attr('boolean') declare secret: boolean;

  @hasMany('mandatary', { async: true, inverse: null })
  declare hasAbstainers: MandataryModel;

  @hasMany('mandatary', { async: true, inverse: null })
  declare hasOpponents: MandataryModel;

  @hasMany('mandatary', { async: true, inverse: null })
  declare hasProponents: MandataryModel;
}
