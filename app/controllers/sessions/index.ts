import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type { SortType } from './types';
import type FilterService from 'frontend-burgernabije-besluitendatabank/services/filter-service';
import type ItemsService from '../../services/items-service';

export default class SessionsIndexController extends Controller {
  @service declare filterService: FilterService;
  @service declare router: RouterService;
  @service declare itemsService: ItemsService;
  @tracked hasFilter = false;

  @tracked dateSort: SortType = 'desc';

  get filters() {
    return this.filterService.filters;
  }

  @action
  handleDateSortChange(event: { target: { value: SortType } }) {
    this.dateSort = event?.target?.value;
    this.filterService.updateFilters({ dateSort: this.dateSort });
  }

  @action
  showFilter() {
    this.hasFilter = true;
  }
}
