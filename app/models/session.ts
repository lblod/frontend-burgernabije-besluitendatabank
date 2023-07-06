import Model, {
  attr,
  belongsTo,
  hasMany,
  type AsyncHasMany,
} from '@ember-data/model';
import { getFormattedDateRange } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date-range';
import AgendaItemModel from './agenda-item';
import GoverningBodyModel from './governing-body';

export default class SessionModel extends Model {
  @attr('date') declare startedAt?: Date;
  @attr('date') declare endedAt?: Date;

  @hasMany('agenda-item') declare agendaItems: AsyncHasMany<AgendaItemModel>;
  @belongsTo('governing-body', { async: false })
  declare governingBody: GoverningBodyModel;

  get name() {
    return this.governingBody?.name ?? 'Ontbrekend bestuursorgaan';
  }

  get municipality() {
    return (
      this.governingBody?.administrativeUnit?.name ??
      'Ontbrekende bestuurseenheid'
    );
  }

  get location() {
    return (
      this.governingBody?.administrativeUnit?.location?.label ??
      'Ontbrekende locatie'
    );
  }

  get hasMunicipality() {
    return !!this.governingBody?.administrativeUnit;
  }

  get dateRange() {
    return getFormattedDateRange(this.startedAt, this.endedAt);
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
