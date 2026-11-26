import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import type ReportModel from 'frontend-burgernabije-besluitendatabank/models/report';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

export const PAGE_SIZE = 10;

type Params = { page?: number };

export type ReportRow = {
  report: ReportModel;
  session: SessionModel | null;
};

export type ValidationReportsModel = {
  rows: ReportRow[];
  page: number;
  total: number;
};

export default class ValidationReportsRoute extends Route<
  ValidationReportsModel,
  Params
> {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare currentSession: CurrentSessionService;

  queryParams = {
    page: { refreshModel: true },
  };

  beforeModel() {
    if (!this.currentSession.isLoggedIn) {
      this.router.transitionTo('home');
    }
  }

  async model(params: Params): Promise<ValidationReportsModel> {
    const page = Number(params.page) || 0;
    const reports = (await this.store.query('report', {
      sort: '-created',
      page: { size: PAGE_SIZE, number: page },
    })) as AdapterPopulatedRecordArrayWithMeta<ReportModel>;
    return {
      rows: await Promise.all(reports.slice().map((r) => this.#toRow(r))),
      page,
      total: reports.meta?.count ?? 0,
    };
  }

  // A report has no relation to its session: the session is the focus node of
  // its results.
  async #toRow(report: ReportModel): Promise<ReportRow> {
    const [result] = (
      await this.store.query('validationresult', {
        filter: { report: { ':id:': report.id } },
        page: { size: 1 },
      })
    ).slice();
    if (!result?.focusNode) return { report, session: null };
    const [session] = (
      await this.store.query('session', {
        filter: { ':uri:': result.focusNode },
        include: 'governing-body-abstract.administrative-unit',
        page: { size: 1 },
      })
    ).slice();
    return { report, session: session ?? null };
  }
}
