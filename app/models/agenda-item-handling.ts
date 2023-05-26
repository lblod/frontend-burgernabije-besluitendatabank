import Model, { attr, hasMany } from '@ember-data/model';
import VoteModel from './vote';

export default class AgendaItemHandlingModel extends Model {
    @attr("boolean") declare public?: boolean;

    @hasMany("vote") declare hasVotes?: VoteModel;
}
