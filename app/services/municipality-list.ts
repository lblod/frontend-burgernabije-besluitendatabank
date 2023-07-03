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
}
