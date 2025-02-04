import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { Resource } from 'ember-modify-based-class-resource';
import type AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import type GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';

import type { MuSearchResponse } from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type MuSearchService from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import type ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';
import type { AgendaItemsLoaderArgs, AgendaItemsParams } from './types';
import { createAgendaItemsQuery } from 'frontend-burgernabije-besluitendatabank/utils/search/agenda-items-query';

export default class AgendaItemsLoader extends Resource<AgendaItemsLoaderArgs> {
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare muSearch: MuSearchService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;

  @tracked data: AgendaItem[] = [];
  @tracked total = 0;

  #currentPage = 0;
  #filters?: AgendaItemsParams;

  get canLoadMore() {
    return this.data.length < this.total;
  }

  get hasResults() {
    return this.data.length > 0;
  }

  get isLoading() {
    return this.loadAgendaItems.isRunning;
  }

  get hasErrored() {
    return this.loadAgendaItems.last?.isError;
  }

  modify(_positional: unknown[], named: AgendaItemsLoaderArgs['Named']) {
    this.#filters = named.filters;
    this.#initializeData();
  }

  #initializeData() {
    this.#resetState();
    this.loadAgendaItems.perform(this.#currentPage);
  }

  #resetState() {
    this.#currentPage = 0;
    this.data = [];
    this.total = 0;
  }

  private readonly loadAgendaItems = task(
    { restartable: true },
    async (page: number) => {
      if (!this.#filters) return;

      const locationIds = await this.#fetchLocationIds();
      const governingBodyClassificationIds =
        await this.governingBodyList.getGoverningBodyClassificationIdsFromLabels(
          this.#filters.governingBodyClassifications,
        );

      const agendaItems: MuSearchResponse<AgendaItem> =
        await this.muSearch.search(
          createAgendaItemsQuery({
            index: 'agenda-items',
            page,
            locationIds,
            governingBodyClassificationIds,
            ...this.#filters,
          }),
        );

      this.data = [
        ...this.data,
        ...agendaItems.items.filter(
          (item) =>
            !this.governingBodyDisabledList.disabledList.some((disabled) =>
              item.governingBodyIdResolved.includes(disabled),
            ),
        ),
      ];
      this.total = agendaItems.count ?? 0;
    },
  );
  async #fetchLocationIds() {
    const municipalityIds =
      await this.municipalityList.getLocationIdsFromLabels(
        this.#filters?.municipalityLabels || [],
      );
    const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
      this.#filters?.provinceLabels || [],
    );
    return [...municipalityIds, ...provinceIds].join(',');
  }

  loadMore = () => {
    if (this.canLoadMore) {
      this.#currentPage++;
      this.loadAgendaItems.perform(this.#currentPage);
    }
  };
}
