import Model, {
  AsyncBelongsTo,
  AsyncHasMany,
  SyncHasMany,
  attr,
  belongsTo,
  hasMany,
} from '@ember-data/model';
import { sortSessions } from 'frontend-burgernabije-besluitendatabank/utils/sort-sessions';
import AgendaItemHandlingModel from './agenda-item-handling';
import SessionModel from './session';

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

  get agendaItemQuality(): {
    qualityMetrics: { label: string; value: boolean }[];
    qualityValue: number;
  } {
    const properties = [
      {
        property: 'title',
        formattedProperty: 'Titel',
      },
      {
        property: 'description',
        formattedProperty: 'Beschrijving',
      },
      {
        property: 'dateFormatted',
        formattedProperty: 'Datum',
      },
      {
        property: 'municipality',
        formattedProperty: 'Bestuurseenheid',
      },
      {
        property: 'session',
        formattedProperty: 'Zitting',
      },
      {
        property: 'governingBodyNameResolved',
        formattedProperty: 'Bestuursorgaan',
      },
      {
        property: 'handledBy',
        formattedProperty: 'Behandeling',
      },
    ];

    const maxQuality = 100;
    const propertyCount = properties.length;
    let quality = 0;
    const qualityMetrics: { label: string; value: boolean }[] = [];

    properties.forEach((property) => {
      const value = this[property.property as keyof AgendaItemModel];
      quality += (value ? maxQuality : 0) / propertyCount;
      qualityMetrics.push({
        label: property.formattedProperty,
        value: !!value,
      });
    });

    return {
      qualityMetrics,
      qualityValue: quality,
    };
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'agenda-item': AgendaItemModel;
  }
}
