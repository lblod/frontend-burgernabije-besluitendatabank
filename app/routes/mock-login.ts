import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import { ROLES } from 'frontend-burgernabije-besluitendatabank/services/current-session';
import type AccountModel from 'frontend-burgernabije-besluitendatabank/models/account';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

export const PAGE_SIZE = 10;

type Params = { search?: string; page?: number };

export type MockUserEntry = {
  account: AccountModel;
  name: string;
  description?: string;
};

export type MockLoginModel = {
  users: MockUserEntry[];
  page: number;
  lastPage: number;
};

const DESCRIPTIONS: Record<string, string> = {
  [ROLES.abb]: 'ABB: ziet de validatierapporten van alle besturen.',
  [ROLES.supplier]:
    'Leverancier: ziet de validatierapporten van de besturen die hij bedient.',
};

export default class MockLoginRoute extends Route<MockLoginModel, Params> {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare currentSession: CurrentSessionService;

  queryParams = {
    search: { refreshModel: true },
    page: { refreshModel: true },
  };

  beforeModel() {
    if (!this.currentSession.isMockLogin) {
      this.router.transitionTo('home');
    }
  }

  async model(params: Params): Promise<MockLoginModel> {
    const page = Number(params.page) || 0;
    const search = params.search?.trim();
    const query = (role: string, pagination: object) =>
      this.store.query('account', {
        include: 'user',
        filter: {
          ':exact:role': role,
          ...(search && { user: { 'family-name': search } }),
        },
        sort: ':no-case:user.family-name',
        page: pagination,
      }) as Promise<AdapterPopulatedRecordArrayWithMeta<AccountModel>>;

    // ABB and the suppliers are few: only on the first page, above the gemeenten.
    const [abb, suppliers, gemeenten] = await Promise.all([
      page === 0 ? query(ROLES.abb, { size: 100 }) : null,
      page === 0 ? query(ROLES.supplier, { size: 100 }) : null,
      query(ROLES.bestuur, { size: PAGE_SIZE, number: page }),
    ]);
    const accounts = [
      ...(abb?.slice() ?? []),
      ...(suppliers?.slice() ?? []),
      ...gemeenten.slice(),
    ];
    const users = await Promise.all(
      accounts.map(async (account) => ({
        account,
        name: (await account.user)?.fullName || 'Onbekende gebruiker',
        description: account.role ? DESCRIPTIONS[account.role] : undefined,
      })),
    );
    const total = gemeenten.meta?.count ?? 0;
    return {
      users,
      page,
      lastPage: Math.max(0, Math.ceil(total / PAGE_SIZE) - 1),
    };
  }
}
