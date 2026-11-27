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
import type ReportModel from 'frontend-burgernabije-besluitendatabank/models/report';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type ValidationReportsController from 'frontend-burgernabije-besluitendatabank/controllers/validation-reports';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';
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

export type ReportRow = {
  report: ReportModel;
  session: SessionModel | null;
};

// AuDataTable reads `length` for the rows on screen and `meta.count` for the
// total, so the rows are handed over as an array carrying that meta.
export type ValidationReportsModel = ReportRow[] & {
  meta?: { count?: number };
};

export default class ValidationReportsRoute extends Route<
  ValidationReportsModel,
  ValidationReportsParams
> {
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
      return this.router.transitionTo('home');
    }
  }

  async model(
    params: ValidationReportsParams,
  ): Promise<ValidationReportsModel> {
    const focusNodes = await this.focusNodeUris(params);
    if (focusNodes && !focusNodes.length) {
      return this.rowsWithMeta([], 0);
    }

    const query: Record<string, unknown> = {
      sort: params.sort || '-created',
      page: {
        size: Number(params.itemsPerPage) || 20,
        number: Number(params.page) || 0,
      },
    };

    if (focusNodes) {
      query['filter'] = {
        validationresults: { ':exact:focus-node': focusNodes.join(',') },
      };
    }

    const reports = (await this.store.query(
      'report',
      query,
    )) as AdapterPopulatedRecordArrayWithMeta<ReportModel>;

    const rows = await Promise.all(
      reports.slice().map((report) => {
        return this.toRow(report);
      }),
    );

    return this.rowsWithMeta(rows, reports.meta?.count ?? 0);
  }

  async setupController(
    controller: ValidationReportsController,
    model: ValidationReportsModel,
    transition: Transition,
  ) {
    super.setupController(controller, model, transition);
    controller.governingBodyOptions = await this.governingBodyOptions();
    controller.restoreSelectedFilters();
  }

  private rowsWithMeta(
    rows: ReportRow[],
    count: number,
  ): ValidationReportsModel {
    const model = rows as ValidationReportsModel;
    model.meta = { count };

    return model;
  }

  // A report has no relation to its session: the session is the focus node of
  // its results.
  private async toRow(report: ReportModel): Promise<ReportRow> {
    const [result] = (
      await this.store.query('validationresult', {
        filter: { report: { ':id:': report.id } },
        page: { size: 1 },
      })
    ).slice();

    if (!result?.focusNode) {
      return { report, session: null };
    }

    const [session] = (
      await this.store.query('session', {
        filter: { ':uri:': result.focusNode },
        include:
          'governing-body-abstract.administrative-unit,governing-body-abstract.classification',
        page: { size: 1 },
      })
    ).slice();

    return { report, session: session ?? null };
  }

  // Reports cannot be filtered on their session directly, so the matching
  // sessions are resolved first and their URIs are used as focus nodes.
  private async focusNodeUris(
    params: ValidationReportsParams,
  ): Promise<string[] | undefined> {
    const governingBody = await this.governingBodyFilter(params);
    if (!governingBody) {
      return undefined;
    }

    const sessions = await this.store.query('session', {
      filter: { 'governing-body-abstract': governingBody },
      page: { size: 1000 },
    });

    const uris: string[] = [];
    for (const session of sessions.slice()) {
      if (session.uri) {
        uris.push(session.uri);
      }
    }

    return uris;
  }

  private async governingBodyFilter(
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

    return governingBody;
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
