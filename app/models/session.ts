import Model, {
  attr,
  belongsTo,
  hasMany,
  type AsyncHasMany,
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

  @belongsTo('governing-body', { async: false, inverse: 'sessions' })
  declare governingBody: GoverningBodyModel;

  get name() {
    return (
      this.governingBody?.isTimeSpecializationOf?.name ||
      this.governingBody?.name ||
      'Ontbrekend bestuursorgaan'
    );
  }

  get municipality() {
    return (
      this.governingBody?.isTimeSpecializationOf?.administrativeUnit?.location
        ?.label ||
      this.governingBody?.administrativeUnit?.location?.label ||
      'Ontbrekende bestuurseenheid'
    );
  }

  get hasMunicipality() {
    return (
      !!this.governingBody?.isTimeSpecializationOf?.administrativeUnit ||
      !!this.governingBody?.administrativeUnit
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
