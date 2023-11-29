import { getFormattedDate } from 'frontend-lokaalbeslist/utils/get-formatted-date';
import { getFormattedDateRange } from 'frontend-lokaalbeslist/utils/get-formatted-date-range';

export default class AgendaItemModel {
  declare id?: string;
  declare locationId?: string;
  declare abstractGoverningBodyLocationName?: string;
  declare governingBodyLocationName?: string;
  declare abstractGoverningBodyName?: string;
  declare governingBodyName?: string;
  declare sessionPlannedStart?: Date;
  declare sessionStartedAt?: Date;
  declare sessionEndedAt?: Date;
  declare title?: string;
  declare description?: string;

  get dateFormatted() {
    if (this.sessionStartedAt || this.sessionEndedAt) {
      return getFormattedDateRange(this.sessionStartedAt, this.sessionEndedAt);
    }
    if (this.sessionPlannedStart) {
      return 'Gepland op ' + getFormattedDate(this.sessionPlannedStart);
    }

    return 'Geen Datum';
  }
  get governingBodyNameResolved() {
    return (
      this.abstractGoverningBodyName ||
      this.governingBodyName ||
      'Ontbrekend bestuursorgaan'
    );
  }

  get municipality() {
    return (
      this.abstractGoverningBodyLocationName ||
      this.governingBodyLocationName ||
      'Ontbrekende bestuurseenheid'
    );
  }
}
