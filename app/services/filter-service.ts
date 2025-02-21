import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type {
  AgendaItemsParams,
  SortType,
} from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items/types';
import type ItemsService from './items-service';

export default class FilterService extends Service {
  @service declare itemsService: ItemsService;
  @tracked filters: AgendaItemsParams = {
    keyword: '',
    municipalityLabels: '',
    provinceLabels: '',
    plannedStartMin: '',
    plannedStartMax: '',
    dateSort: 'desc' as SortType,
    governingBodyClassifications: '',
    dataQualityList: [],
    status: 'Alles',
  };

  updateFilters(newFilters: Partial<AgendaItemsParams>) {
    this.filters = { ...this.filters, ...newFilters };
  }
}
