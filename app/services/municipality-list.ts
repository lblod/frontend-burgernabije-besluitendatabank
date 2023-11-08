import Service, { service } from '@ember/service';
import Store from '@ember-data/store';
import LocationModel from 'frontend-burgernabije-besluitendatabank/models/location';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export default class MunicipalityListService extends Service {
  @service declare store: Store;

  private _municipalities?: Array<{ label: string; id: string }>;

  /**
   * Get all municipalities
   *
   * - If possible, return it from local variable/cache
   * - If that is empty, populate it with & return from
   *
   * @returns A promise for an array of municipalities
   **/
  async municipalities() {
    if (!this._municipalities) {
      this._municipalities = await this._loadMunicipalities();
    }

    return this._municipalities;
  }

  /**
   * Requests & parses municipalities from Ember-Data
   *
   * @returns An promise for an array of municipalities, parsed into objects with an id & label property
   */

  private async _loadMunicipalities() {
    const municipalities = await this.store.query('location', {
      page: { size: 600 },
      filter: {
        niveau: 'Gemeente',
      },
      sort: ':no-case:label',
    });

    return municipalities.map((location: LocationModel) => ({
      id: location.id,
      label: location.label,
    }));
  }

  /**
   *
   * @param labels an array of location labels
   *               Alternatively, a string of location labels
   * @param stringSeperator the seperator to split labels, if labels is a string
   *                        Defaults to the seperator defined in helpers/constants.ts
   * @returns a Promise for a joined string of those locations' id's, or undefined
   */
  async getLocationIdsFromLabels(
    labels?: Array<string> | string
  ): Promise<string | undefined> {
    const municipalities = await this.municipalities();
    if (typeof labels === 'string') {
      labels = deserializeArray(labels);
    }

    if (!labels || !municipalities) {
      return undefined;
    }

    const locationIds: Array<string> = municipalities
      .filter(({ label }) => labels?.includes(label))
      .map(({ id }) => id);

    return locationIds.join(',');
  }
}
