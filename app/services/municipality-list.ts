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
        const municipalities = await this.store.query("location", {
            page: { size: 600 },
            filter: {
                niveau: "Gemeente",
            },
            sort: ":no-case:label",
        });

        return municipalities
            .toArray()
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
