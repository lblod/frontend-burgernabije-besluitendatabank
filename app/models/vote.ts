import Model, { attr, hasMany } from '@ember-data/model';
import MandataryModel from './mandatary';

export default class VoteModel extends Model {
    @attr('number') declare numberOfAbstentions: number;
    @attr('number') declare numberOfOpponents: number;
    @attr('number') declare numberOfProponents: number;
    @attr('boolean') declare secret: boolean;

    // @hasMany('mandatary') declare hasPresents: MandataryModel;
    @hasMany('mandatary') declare hasAbstainers: MandataryModel;
    // @hasMany('mandatary') declare hasVoters: MandataryModel;
    @hasMany('mandatary') declare hasOpponents: MandataryModel;
    @hasMany('mandatary') declare hasProponents: MandataryModel;
}
