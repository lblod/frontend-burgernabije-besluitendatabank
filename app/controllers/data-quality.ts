import Controller from '@ember/controller';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import FeaturesService from 'frontend-burgernabije-besluitendatabank/services/features';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';

export default class DataQualityController extends Controller {
  // add statistics that calculate the following:
  // - total number of agenda items
  // - total number of agenda items that have been treated
  // - total number of agenda items that have a title and a description
  // - total number of agenda items that don't have a title and a description
  // - top 10 governing bodies with the most agenda items
  // add a computed property that returns the percentage of agenda items that have been treated

  @service declare municipalityList: MunicipalityListService;
  @service declare router: RouterService;
  @tracked currentlyLoading = false;
  @service declare features: FeaturesService;

  /** Controls the loading animation of the "locatie's opslaan" button */
  @tracked loading = false;
  @tracked selectedMunicipality: { label: string; id: string } | null = null;

  get municipalities() {
    return this.municipalityList.municipalities();
  }

  get statisticsFeatureFlagEnabled() {
    return this.features.isEnabled('statistics-page-feature');
  }

  /** Resets the button loading animation */
  @action resetLoading() {
    this.loading = false;
  }

  @action handleMunicipalityChange(selectedMunicipality: {
    label: string;
    id: string;
  }) {
    // add query param for location ids
    this.selectedMunicipality = selectedMunicipality;
    this.router.transitionTo('data-quality', {
      queryParams: {
        gemeentes: selectedMunicipality ? selectedMunicipality.label : '',
      },
    });
  }

  get totalAgendaItems(): number {
    const model = this.model as AgendaItem[];
    return model.length;
  }

  get totalAgendaItemsTreated(): number {
    const model = this.model as AgendaItem[];
    return model.filter((item: AgendaItem) => item.handledBy).length;
  }

  get totalAgendaItemsWithTitleAndDescription(): number {
    const model = this.model as AgendaItem[];
    return model.filter((item: AgendaItem) => item.handledBy).length;
  }

  get totalAgendaItemsWithoutTitleAndDescription(): number {
    const model = this.model as AgendaItem[];
    return model.filter((item: AgendaItem) => item.handledBy).length;
  }

  get topTenGoverningBodies(): number {
    const model = this.model as AgendaItem[];
    return model.filter((item: AgendaItem) => item.handledBy).length;
  }
}
