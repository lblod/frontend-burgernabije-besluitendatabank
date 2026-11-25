import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type { LocalGovernmentOption } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import { getFormattedDate } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date';
import { deserializeLabels } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export type GoverningBodyOption = {
  id: string;
  label: string;
  type: string;
};

export default class ValidationReportsController extends Controller {
  queryParams = [
    { municipalityLabels: QueryParameterKeys.municipalities },
    { provinceLabels: QueryParameterKeys.provinces },
    { governingBodyClassifications: QueryParameterKeys.governingBodies },
    { sort: QueryParameterKeys.sort },
    { page: QueryParameterKeys.page },
    { itemsPerPage: QueryParameterKeys.size },
  ];

  @tracked municipalityLabels = '';
  @tracked provinceLabels = '';
  @tracked governingBodyClassifications = '';
  @tracked sort = '';
  @tracked page = 0;
  @tracked itemsPerPage = 20;
  hidePagination = false;

  @service declare currentSession: CurrentSessionService;
  @service declare governmentList: GovernmentListService;

  @tracked governingBodyOptions: GoverningBodyOption[] = [];
  @tracked selectedGovernments: LocalGovernmentOption[] = [];
  @tracked selectedGoverningBodies: GoverningBodyOption[] = [];

  @tracked maturityLevel: string | null = null;
  @tracked lastHarvestedAt: Date | null = null;

  get canFilterByGovernment() {
    return this.currentSession.isAbb || this.currentSession.isSupplier;
  }

  get maturityLevelLabel() {
    return this.maturityLevel ?? 'Maturiteitsniveau onbekend';
  }

  get lastHarvestLabel() {
    return this.lastHarvestedAt
      ? `Laatste harvesting op ${getFormattedDate(this.lastHarvestedAt)}`
      : 'Laatste harvesting onbekend';
  }

  restoreSelectedFilters() {
    this.selectedGovernments = [
      ...this.governmentOptionsFor(
        this.municipalityLabels,
        LocalGovernmentType.Municipality,
      ),
      ...this.governmentOptionsFor(
        this.provinceLabels,
        LocalGovernmentType.Province,
      ),
    ];

    const labels = deserializeLabels(this.governingBodyClassifications);
    this.selectedGoverningBodies = this.governingBodyOptions.filter(
      ({ label }) => labels.includes(label),
    );
  }

  @action
  updateSelectedGovernments(newOptions: LocalGovernmentOption[]) {
    this.selectedGovernments = newOptions;
    this.page = 0;
  }

  @action
  updateSelectedGoverningBodies(newOptions: GoverningBodyOption[]) {
    this.selectedGoverningBodies = newOptions;
    this.page = 0;
  }

  private governmentOptionsFor(
    labels: string,
    type: LocalGovernmentType,
  ): LocalGovernmentOption[] {
    return deserializeLabels(labels).map((label) => ({ label, type }));
  }
}
