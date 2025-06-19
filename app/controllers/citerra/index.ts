import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import type { GoverningBodyOption } from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import {
  type AreaParams,
  type EntityOption,
  type TravelReasonOption,
} from './types';
import { defaultTravelReasons } from './data';
import type ConceptModel from 'frontend-burgernabije-besluitendatabank/models/concept';

type LatLngPoint = { lat: number; lng: number };

export default class AgendaItemsIndexController extends Controller {
  firstStep = 0;
  lastStep = 3;

  complementaryColors = ['green', 'blue', 'red', 'orange', 'purple', 'yellow'];
  questions = [
    'Je zal rijden als?',
    'Wat is de reden van de reis?',
    'In welke gemeente ga je rijden?',
    'Door welke zones ga je rijden?',
  ];

  @tracked zoom = 14;
  @tracked lat = 0;
  @tracked lng = 0;
  @tracked step = this.firstStep;
  @tracked selectedGovernment: GoverningBodyOption[] = [];
  @tracked areas: Area[] = [];
  @tracked entityTypes: Array<ConceptModel> = (
    this.model as { applicantTypes: Array<ConceptModel> }
  ).applicantTypes;
  @tracked travelReasons: TravelReasonOption[] = defaultTravelReasons;
  @tracked selectedAreas: Area[] = [];
  @tracked selectedEntityType: EntityOption | null = null;
  @tracked selectedTravelReason: TravelReasonOption | null = null;
  @tracked isFormSubmitted: boolean = false;
  @tracked isLoading: boolean = false;

  @service declare governmentList: GovernmentListService;
  @service declare governingBodyList: GoverningBodyListService;
  private abortController?: AbortController;

  get isFirstStep() {
    return this.step === this.firstStep;
  }

  get isLastStep() {
    return this.step === this.lastStep;
  }
  get canGoToNextStep() {
    if (this.step === 0) {
      return !this.selectedEntityType;
    }
    if (this.step === 1) {
      return !this.selectedTravelReason;
    }
    if (this.step === 2) {
      return this.selectedGovernment.length === 0;
    }
    if (this.step === 3) {
      return this.selectedAreas.length === 0;
    }
    return true;
  }

  @action
  getColorForArea(index: number): string {
    return (
      this.complementaryColors[index % this.complementaryColors.length] ??
      'gray'
    );
  }

  @action
  setStep(value: number) {
    this.step = value;
  }

  @action
  nextStep() {
    if (this.step < this.lastStep) {
      this.step++;
    }
  }

  @action
  prevStep() {
    if (this.step > this.firstStep) {
      this.step--;
    }
  }

  @action
  submitForm() {
    this.isFormSubmitted = true;
    this.step = this.lastStep + 1;
  }

  @action
  resetForm() {
    this.isFormSubmitted = false;
    this.step = this.firstStep;
    this.selectedGovernment = [];
    this.selectedAreas = [];
    this.selectedEntityType = null;
    this.selectedTravelReason = null;
  }

  @action
  async setGovernment(newOptions: GoverningBodyOption[]) {
    this.abortController?.abort();
    this.abortController = new AbortController();

    this.isLoading = true;
    this.selectedGovernment = newOptions;
    this.selectedAreas = [];
    this.areas = [];

    try {
      await this.getCoordinates(this.abortController.signal);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  @action
  setEntityType(value: EntityOption) {
    this.selectedEntityType = value;
  }

  @action
  setTravelReason(value: TravelReasonOption) {
    this.selectedTravelReason = value;
  }

  async getCoordinates(signal: AbortSignal) {
    if (!this.selectedGovernment || this.selectedGovernment.length === 0) {
      return;
    }

    const promises = this.selectedGovernment.map(async ({ label }) => {
      try {
        const coord = await this.fetchCoords(label, signal);
        await this.generateRandomZones(coord.lat, coord.lng, label);
        return coord;
      } catch (error) {
        console.error(`Error fetching coordinates for ${label}:`, error);
        return { lat: 0, lng: 0 };
      }
    });

    const coordinates = await Promise.all(promises);
    const coordinate = coordinates[0];
    if (!coordinates || coordinates.length === 0 || !coordinate) {
      throw new Error('No valid coordinates found');
    }

    this.lat = coordinate.lat;
    this.lng = coordinate.lng;

    return { lat: this.lat, lng: this.lng };
  }

  @action
  async fetchCoords(label: string, signal?: AbortSignal): Promise<LatLngPoint> {
    const query = encodeURIComponent(label);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const res = await fetch(url, {
      signal,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'your-app-name (your@email.com)',
      },
    });

    const data = await res.json();
    if (data.length === 0) {
      throw new Error(`Location not found: "${label}"`);
    }
    const { lat, lon } = data[0];
    return {
      lat,
      lng: lon,
    };
  }

  generateRandomZones(lat: number, lng: number, municipality: string) {
    const numZones = 2 + Math.floor(Math.random() * 3);
    const zones: Area[] = [];
    const offsetScale = 0.002;

    for (let z = 0; z < numZones; z++) {
      const numPoints = Math.floor(Math.random() * 8) + 8;
      const angleStep = (2 * Math.PI) / numPoints;

      const baseLat = Number(lat) + (Math.random() - 0.5) * 0.01;
      const baseLng = Number(lng) + (Math.random() - 0.5) * 0.01;

      const points: { lat: number; lng: number }[] = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        const radius = offsetScale + Math.random() * offsetScale;
        const offsetLat = radius * Math.sin(angle);
        const offsetLng = radius * Math.cos(angle);

        points.push({
          lat: Number(baseLat + offsetLat),
          lng: Number(baseLng + offsetLng),
        });
      }

      zones.push(
        new Area({
          name: `${municipality} - Zone ${z + 1} `,
          municipality,
          coordinates: points,
        }),
      );
    }

    this.areas.push(...zones);
  }

  @action
  async selectAreas(selected: Area[] | Area) {
    this.abortController = new AbortController();
    if (Array.isArray(selected)) {
      const uniqueNames = new Set();
      this.selectedAreas = selected
        .filter((a) => {
          if (uniqueNames.has(a.name)) return false;
          uniqueNames.add(a.name);
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      const lastSelected = selected[selected.length - 1];
      if (lastSelected) {
        const coordinates = await this.fetchCoords(
          lastSelected.name,
          this.abortController.signal,
        );
        if (this.lat !== coordinates.lat && this.lng !== coordinates.lng) {
          this.lat = coordinates.lat;
          this.lng = coordinates.lng;
        }
      }
    } else {
      const exists = this.selectedAreas.some((a) => a.name === selected.name);

      this.selectedAreas = exists
        ? this.selectedAreas.filter((a) => a.name !== selected.name)
        : [...this.selectedAreas, selected];

      this.selectedAreas.sort((a, b) => a.name.localeCompare(b.name));
      const coordinates = await this.fetchCoords(
        selected.name,
        this.abortController.signal,
      );
      this.lat = coordinates.lat;
      this.lng = coordinates.lng;
    }
  }

  @action
  isAreaSelected(area: Area): boolean {
    return this.selectedAreas.some((a) => a.name === area.name);
  }

  @action
  getTooltipText(index: number): string {
    return `Stap ${index + 1} - ${this.questions[index]}`;
  }
  @action
  goToArea(area: Area) {
    if (!area.coordinates || area.coordinates.length === 0) return;
    this.step = this.lastStep;
    this.lat = (area.coordinates[0] ?? { lat: 0, lng: 0 }).lat;
    this.lng = (area.coordinates[0] ?? { lat: 0, lng: 0 }).lng;
    this.zoom = 14;
  }
  @action
  async goToMunicipality(municipality: string) {
    const coordinates = await this.fetchCoords(municipality);
    this.lat = coordinates.lat;
    this.lng = coordinates.lng;
  }
}

class Area {
  @tracked name: string;
  @tracked municipality: string;
  @tracked coordinates: LatLngPoint[];

  constructor({ name, municipality, coordinates }: AreaParams) {
    this.name = name;
    this.municipality = municipality;
    this.coordinates = coordinates;
  }
}
