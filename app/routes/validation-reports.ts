import Route from '@ember/routing/route';

import { service } from '@ember/service';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import type MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import type ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';
import type GoverningBodyClassificationCodeModel from 'frontend-burgernabije-besluitendatabank/models/governing-body-classification-code';
import type ValidationReportsController from 'frontend-burgernabije-besluitendatabank/controllers/validation-reports';
import { deserializeLabels } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

type ValidationReportsParams = {
  municipalityLabels?: string;
  provinceLabels?: string;
  governingBodyClassifications?: string;
  sort?: string;
  page?: number;
  itemsPerPage?: number;
};

type Filter = Record<string, unknown>;

export default class ValidationReportsRoute extends Route {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare currentSession: CurrentSessionService;
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;

  queryParams = {
    municipalityLabels: {
      as: QueryParameterKeys.municipalities,
      refreshModel: true,
    },
    provinceLabels: {
      as: QueryParameterKeys.provinces,
      refreshModel: true,
    },
    governingBodyClassifications: {
      as: QueryParameterKeys.governingBodies,
      refreshModel: true,
    },
    sort: { refreshModel: true },
    page: { refreshModel: true },
    itemsPerPage: { refreshModel: true },
  };

  private classificationCodes?: GoverningBodyClassificationCodeModel[];

  async beforeModel() {
    await this.currentSession.load();
    if (!this.currentSession.isLoggedIn) {
      this.router.transitionTo('home');
    }
  }

  async model(params: ValidationReportsParams) {
    const query: Record<string, unknown> = {
      include:
        'session.governing-body-abstract.administrative-unit,session.governing-body-abstract.classification',
      sort: params.sort || '-created',
      page: {
        size: Number(params.itemsPerPage) || 20,
        number: Number(params.page) || 0,
      },
    };

    const filter = await this.filterFor(params);
    if (filter) {
      query['filter'] = filter;
    }

    return this.store.query('validation-report', query);
  }

  async setupController(
    controller: ValidationReportsController,
    model: Awaited<ReturnType<ValidationReportsRoute['model']>>,
    transition: Transition,
  ) {
    super.setupController(controller, model, transition);
    controller.governingBodyOptions = await this.governingBodyOptions();
    controller.restoreSelectedFilters();
  }

  private async filterFor(
    params: ValidationReportsParams,
  ): Promise<Filter | undefined> {
    const governingBody: Filter = {};

    const administrativeUnit = await this.administrativeUnitFilter(params);
    if (administrativeUnit) {
      governingBody['administrative-unit'] = administrativeUnit;
    }

    const classificationIds = await this.classificationIds(
      params.governingBodyClassifications,
    );
    if (classificationIds.length) {
      governingBody['classification'] = {
        ':id:': classificationIds.join(','),
      };
    }

    if (!Object.keys(governingBody).length) {
      return undefined;
    }

    return { session: { 'governing-body-abstract': governingBody } };
  }

  private async administrativeUnitFilter(
    params: ValidationReportsParams,
  ): Promise<Filter | undefined> {
    const { isAbb, isSupplier, groupId } = this.currentSession;
    if (!isAbb && !isSupplier) {
      return groupId ? { ':id:': groupId } : undefined;
    }

    const [municipalityIds, provinceIds] = await Promise.all([
      this.municipalityList.getLocationIdsFromLabels(params.municipalityLabels),
      this.provinceList.getProvinceIdsFromLabels(params.provinceLabels ?? ''),
    ]);

    const locationIds = [...municipalityIds, ...provinceIds];
    return locationIds.length
      ? { location: { ':id:': locationIds.join(',') } }
      : undefined;
  }

  private async classificationIds(
    governingBodyClassifications?: string,
  ): Promise<string[]> {
    const labels = deserializeLabels(governingBodyClassifications);
    if (!labels.length) {
      return [];
    }

    return (await this.loadClassificationCodes())
      .filter((code) => labels.includes(code.label))
      .map((code) => code.id);
  }

  private async loadClassificationCodes() {
    this.classificationCodes ??= (
      await this.store.query('governing-body-classification-code', {
        page: { size: 999 },
        sort: 'label',
      })
    ).slice();

    return this.classificationCodes;
  }

  private async governingBodyOptions() {
    const codes = await this.loadClassificationCodes();

    const seen = new Set<string>();
    return codes
      .filter((code) => {
        if (!code.label || seen.has(code.label)) {
          return false;
        }
        seen.add(code.label);
        return true;
      })
      .map((code) => ({
        id: code.id,
        label: code.label,
        type: QueryParameterKeys.governingBodies,
      }));
  }
}
