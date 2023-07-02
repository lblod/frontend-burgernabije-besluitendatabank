import Service, { service } from '@ember/service';
import Store from "@ember-data/store";
import LocationModel from 'frontend-burgernabije-besluitendatabank/models/location';

export default class MunicipalityListService extends Service {
    @service declare store: Store;

    private _municipalities?: Array<{ label: string; id: string }>;

    async municipalities() {
        if (!this._municipalities) {
            this._municipalities = await this._loadMunicipalities();
        }

        return this._municipalities;
    }

    private async _loadMunicipalities() {
        /**
         * Our endpoint (using my-cl-resources) allows sorting!
         * However, this goes a bit wacky when different casing is involved
         * However however, the :no-case: helper is built-in to help with this
         * However however however, Ember's serialisation of the request turns it into %3Ano-case%3A, which doesn't work
         * So instead, use a basic sort in the request, and then sort later in JavaScript
         */
        const municipalities = await this.store.query("location", {
            page: { size: 600 },
            filter: {
                niveau: "Gemeente",
            },
            sort: "label",
        });

        return municipalities
            .toArray()
            .sortBy("label")
            .map((location: LocationModel) => ({id: location.id, label: location.label}));
    }


    async getLocationIdsFromLabels(labels: Array<string>): Promise<Array<string>> {
        const locationIds : Array<string> = [];
        const municipalities = await this.municipalities();
        
        for (let i = 0; i < labels.length; i++) {
          let label = labels[i];
          let municipality = municipalities.find((municipality) => municipality.label === label)
          if (municipality) {
            locationIds.push(municipality.id);
          }
        }
    
        return locationIds;
    }
}
