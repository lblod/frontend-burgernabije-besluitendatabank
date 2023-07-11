import Model, { attr, belongsTo } from '@ember-data/model';
import AgendaItemHandlingModel from './agenda-item-handling';
import SessionModel from './session';

export default class AgendaItemModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende titel' }) declare title: string;
  @attr('string') declare description: string;
  @attr('string') declare alternateLink: string;
  @attr('boolean') declare plannedPublic: boolean;

  @belongsTo('session', { async: true, inverse: 'agendaItems' })
  declare session?: SessionModel;

  @belongsTo('agenda-item-handling', { async: true, inverse: null })
  declare handledBy?: AgendaItemHandlingModel;
}
