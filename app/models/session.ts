import Model, {
  attr,
  belongsTo,
  hasMany,
  AsyncHasMany,
  AsyncBelongsTo,
} from '@ember-data/model';
import { getFormattedDateRange } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date-range';
import { getFormattedDate } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date';
import AgendaItemModel from './agenda-item';
import GoverningBodyModel from './governing-body';

export default class SessionModel extends Model {
  @attr('date') declare plannedStart?: Date;
  @attr('date') declare startedAt?: Date;
  @attr('date') declare endedAt?: Date;

  @hasMany('agenda-item', { async: true, inverse: 'sessions' })
  declare agendaItems: AsyncHasMany<AgendaItemModel>;

  @belongsTo('governing-body', { async: true, inverse: 'sessions' })
  declare governingBody: AsyncBelongsTo<GoverningBodyModel>;

  get governingBodyValue() {
    // cast this because of https://github.com/typed-ember/ember-cli-typescript/issues/1416
    return (this as SessionModel)
      .belongsTo('governingBody')
      ?.value() as GoverningBodyModel | null;
  }

  /**
   * @returns
   * - ... the session's timeSpecialised governing body's name
   * - ... if the above can't be found, the abstracted governing body's name
   * - ... if the above can't be found, an error string
   *
   * This naming scheme is in relation to the app/back-end
   */
  get governingBodyNameResolved() {
    return (
      this.governingBodyValue?.isTimeSpecializationOfValue?.name ||
      this.governingBodyValue?.name ||
      'Ontbrekend bestuursorgaan'
    );
  }

  get municipality() {
    return (
      this.governingBodyValue?.isTimeSpecializationOfValue
        ?.administrativeUnitValue?.locationValue?.label ||
      this.governingBodyValue?.administrativeUnitValue?.locationValue?.label ||
      'Ontbrekende bestuurseenheid'
    );
  }

  get hasMunicipality() {
    return (
      !!this.governingBodyValue?.isTimeSpecializationOfValue
        ?.administrativeUnitValue ||
      !!this.governingBodyValue?.administrativeUnitValue
    );
  }

  get dateFormatted() {
    if (this.startedAt || this.endedAt) {
      return getFormattedDateRange(this.startedAt, this.endedAt);
    }
    if (this.plannedStart) {
      return 'Gepland op ' + getFormattedDate(this.plannedStart);
    }

    return 'Geen Datum';
  }

  get agendaItemCount() {
    const count = this.agendaItems?.length ?? 0;

    return `${count} ${+count <= 1 ? 'agendapunt' : 'agendapunten'}`;
  }
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    session: SessionModel;
  }
}
