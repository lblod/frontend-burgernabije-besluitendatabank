import Controller from '@ember/controller';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';

export default class DataQualityController extends Controller {
  // add statistics that calculate the following:
  // - total number of agenda items
  // - total number of agenda items that have been treated
  // - total number of agenda items that have a title and a description
  // - total number of agenda items that don't have a title and a description
  // - top 10 governing bodies with the most agenda items
  // add a computed property that returns the percentage of agenda items that have been treated

  get totalAgendaItems(): number {
    const model = this.model as AgendaItem[];
    return model.length;
  }

  get totalAgendaItemsTreated(): number {
    const model = this.model as AgendaItem[];
    return model.filter((item: AgendaItem) => item.handledBy).length;
  }

  get totalAgendaItemsWithTitleAndDescription(): number {
    const model = this.model as AgendaItem[];
    return model.filter((item: AgendaItem) => item.handledBy).length;
  }

  get totalAgendaItemsWithoutTitleAndDescription(): number {
    const model = this.model as AgendaItem[];
    return model.filter((item: AgendaItem) => item.handledBy).length;
  }

  get topTenGoverningBodies(): number {
    const model = this.model as AgendaItem[];
    return model.filter((item: AgendaItem) => item.handledBy).length;
  }
}
