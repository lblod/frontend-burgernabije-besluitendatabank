import Service, { service } from '@ember/service';
import Store from '@ember-data/store';
import LocationModel from 'frontend-burgernabije-besluitendatabank/models/location';

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
 * @returns a Promise for an array of those locations' id's
 */
  async getLocationIdsFromLabels(
    labels: Array<string>
  ): Promise<Array<string>> {
    const locationIds: Array<string> = [];
    const municipalities = await this.municipalities();

    if (municipalities) {

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i];
        const municipality = municipalities.find(
          (municipality) => municipality.label === label
        );
        if (municipality) {
          locationIds.push(municipality.id);
        }
      }
    }

    return locationIds;
  }
}
