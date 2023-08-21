import Controller from '@ember/controller';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import { serializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';

export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare municipalityList: MunicipalityListService;

  /** Controls the loading animation of the "locatie's opslaan" button */
  @tracked loading = false;
  @tracked selectedMunicipalities: Array<{ label: string; id: string }> = [];

  get municipalities() {
    return this.municipalityList.municipalities();
  }

  /** Resets the button loading animation */
  @action resetLoading() {
    this.loading = false;
  }

  @action handleMunicipalityChange(
    selectedMunicipalities: Array<{ label: string; id: string }>
  ) {
    this.selectedMunicipalities = selectedMunicipalities;
  }

  @action handleMunicipalitySelect() {
    this.loading = true;
    this.router.transitionTo('agenda-items', {
      queryParams: {
        gemeentes: serializeArray(
          this.selectedMunicipalities.map((municipality) => municipality.label)
        ),
      },
    });
  }
}
