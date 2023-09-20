import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  SyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';
import AgendaItemHandlingModel from './agenda-item-handling';
import SessionModel from './session';
import { sortSessions } from 'frontend-burgernabije-besluitendatabank/utils/sort-sessions';

export default class AgendaItemModel extends Model {
  @attr('string', { defaultValue: 'Ontbrekende titel' }) declare title: string;
  @attr('string') declare description: string;
  @attr('string') declare alternateLink: string;
  @attr('boolean') declare plannedPublic: boolean;

  @hasMany('session', { async: true, inverse: 'agendaItems' })
  declare sessions?: AsyncHasMany<SessionModel>;

  @belongsTo('agenda-item-handling', { async: true, inverse: null })
  declare handledBy?: AsyncBelongsTo<AgendaItemHandlingModel>;

  /**
   * @returns the first session with hasMunicipality == true
   * This is the session we want to use to resolve municipality & governingBody name
   */
  get session() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    const sessions: SyncHasMany<SessionModel> | null = (this as AgendaItemModel)
      .hasMany('sessions')
      ?.value();

    // We want to use a session with municipality and start date in priority
    const session = sessions?.slice()?.sort(sortSessions)?.shift();

    return session;
  }

  get municipality() {
    return this.session?.municipality;
  }

  get governingBodyNameResolved() {
    return this.session?.governingBodyNameResolved;
  }

  get dateFormatted() {
    return this.session?.dateFormatted;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'agenda-item': AgendaItemModel;
  }
}
