import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import type MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import type Session from 'frontend-burgernabije-besluitendatabank/models/mu-search/session';
import type { MuSearchResponse } from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type MuSearchService from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import { task } from 'ember-concurrency';
import { Resource } from 'ember-modify-based-class-resource';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';

import type { SessionsLoaderArgs, SessionsParams } from './types';
import { createSessionsQuery } from 'frontend-burgernabije-besluitendatabank/utils/search/sessions-query';

export default class SessionsLoader extends Resource<SessionsLoaderArgs> {
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare muSearch: MuSearchService;

  @tracked data: Session[] = [];
  @tracked total = 0;

  #currentPage = 0;
  #filters?: SessionsParams;

  get canLoadMore() {
    return this.data.length < this.total;
  }

  get hasResults() {
    return this.data.length > 0;
  }

  get isLoading() {
    return this.loadSessions.isRunning;
  }

  get hasErrored() {
    return this.loadSessions.last?.isError;
  }

  modify(positional: unknown[], named: SessionsLoaderArgs['Named']) {
    this.#filters = named.filters;
    this.#initializeData();
  }

  #initializeData() {
    this.#resetState();
    this.loadSessions.perform(this.#currentPage);
  }

  #resetState() {
    this.#currentPage = 0;
    this.data = [];
    this.total = 0;
  }

  private readonly loadSessions = task(
    { restartable: true },
    async (page: number) => {
      if (!this.#filters) {
        return;
      }

      const municipalityIds =
        await this.municipalityList.getLocationIdsFromLabels(
          this.#filters.municipalityLabels,
        );

      const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
        this.#filters.provinceLabels,
      );

      const locationIds = [...municipalityIds, ...provinceIds].join(',');

      const { keyword, plannedStartMin, plannedStartMax, dateSort } =
        this.#filters;

      const governingBodyClassificationIds =
        await this.governingBodyList.getGoverningBodyClassificationIdsFromLabels(
          this.#filters.governingBodyClassifications,
        );

      const sessions: MuSearchResponse<Session> = await this.muSearch.search(
        createSessionsQuery({
          index: 'sessions',
          page,
          keyword,
          locationIds,
          governingBodyClassificationIds,
          plannedStartMin,
          plannedStartMax,
          dateSort,
        }),
      );

      this.total = sessions.count ?? 0;
      this.data = [...this.data, ...sessions.items.slice()];
    },
  );

  loadMore = () => {
    if (this.canLoadMore) {
      this.#currentPage += 1;
      this.loadSessions.perform(this.#currentPage);
    }
  };
}
