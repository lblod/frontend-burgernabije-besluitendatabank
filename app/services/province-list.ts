import Store from '@ember-data/store';
import Service, { service } from '@ember/service';
import ENV from 'frontend-burgernabije-besluitendatabank/config/environment';
export default class ProvinceListService extends Service {
  @service declare store: Store;
  private _provinces?: Array<{ label: string; id: string }>;

  async provinces() {
    if (!this._provinces) {
      this._provinces = await this._loadProvinces();
    }

    return this._provinces;
  }

  async provinceLabels() {
    if (!this._provinces) {
      this._provinces = await this._loadProvinces();
    }
    return this._provinces;
  }

  async getProvinceIdsFromLabels(
    labels: Array<string> | string
  ): Promise<string | undefined> {
    const provinces = await this.provinces();
    if (!labels || labels.length === 0) {
      return;
    }

    const provinceIds = provinces
      .filter((province) => labels.includes(province.label))
      .map(({ id }) => id);

    return provinceIds.join(',');
  }

  private async _loadProvinces() {
    const provinces = await this.store.query('administrative-unit', {
      filter: { classification: 'Provincie' },
      page: { size: 100 },
    });
    return provinces.map((province) => ({
      label: province.name,
      id: province.id,
      type: ENV.APP['provinces'],
    }));
  }
}
declare module '@ember/service' {
  interface Registry {
    'province-list': ProvinceListService;
  }
}
