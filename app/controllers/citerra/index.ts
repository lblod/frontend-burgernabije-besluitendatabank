import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type { GoverningBodyOption } from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import {
  type AreaParams,
  type EntityOption,
  type TravelReasonOption,
} from './types';
import { defaultEntityTypes, defaultTravelReasons } from './data';

type LatLngPoint = { lat: number; lng: number };

export default class AgendaItemsIndexController extends Controller {
  firstStep = 0;
  lastStep = 3;

  complementaryColors = ['green', 'blue', 'red', 'orange', 'purple', 'yellow'];
  questions = [
    'In welke gemeente ga je rijden?',
    'Door welke zones ga je rijden?',
    'Je zal rijden als?',
    'Wat is de reden van de reis?',
  ];

  @tracked zoom = 14;
  @tracked lat = 0;
  @tracked lng = 0;
  @tracked step = this.firstStep;
  @tracked selectedGovernment: GoverningBodyOption[] | null = null;
  @tracked areas: Area[] = [];
  @tracked entityTypes = defaultEntityTypes;
  @tracked travelReasons: TravelReasonOption[] = defaultTravelReasons;
  @tracked selectedAreas: Area[] = [];
  @tracked selectedEntityType: EntityOption | null = null;
  @tracked selectedTravelReason: TravelReasonOption | null = null;
  @tracked isFormSubmitted: boolean = false;
  @tracked isLoading: boolean = false;

  @service declare governmentList: GovernmentListService;
  @service declare governingBodyList: GoverningBodyListService;

  get isFirstStep() {
    return this.step === this.firstStep;
  }

  get isLastStep() {
    return this.step === this.lastStep;
  }
  get canGoToNextStep() {
    if (this.step === 0) {
      return !this.selectedGovernment;
    }
    if (this.step === 1) {
      return this.selectedAreas.length === 0;
    }
    if (this.step === 2) {
      return !this.selectedEntityType;
    }
    if (this.step === 3) {
      return !this.selectedTravelReason;
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
    this.selectedGovernment = null;
    this.selectedAreas = [];
    this.selectedEntityType = null;
    this.selectedTravelReason = null;
  }

  @action
  async setGovernment(newOptions: GoverningBodyOption[]) {
    this.isLoading = true;
    this.selectedGovernment = newOptions;
    this.selectedAreas = [];
    this.areas = [];
    await this.getCoordinates();
    this.isLoading = false;
  }

  @action
  setEntityType(value: EntityOption) {
    this.selectedEntityType = value;
  }

  @action
  setTravelReason(value: TravelReasonOption) {
    this.selectedTravelReason = value;
  }

  async getCoordinates() {
    if (!this.selectedGovernment || this.selectedGovernment.length === 0) {
      throw new Error('No government selected');
    }

    const promises = this.selectedGovernment.map(({ label }) => {
      const coordinates = this.fetchCoords(label);
      coordinates.then((coord) => {
        this.generateRandomZones(coord.lat, coord.lng, label);
      });
      return coordinates.catch((error) => {
        console.error(`Error fetching coordinates for ${label}:`, error);
        return { lat: 0, lng: 0 };
      });
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

  async fetchCoords(label: string): Promise<LatLngPoint> {
    const query = encodeURIComponent(label);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const res = await fetch(url, {
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
      lat: lat,
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
        const coordinates = await this.fetchCoords(lastSelected.name);
        this.lat = coordinates.lat;
        this.lng = coordinates.lng;
      }
    } else {
      const exists = this.selectedAreas.some((a) => a.name === selected.name);

      this.selectedAreas = exists
        ? this.selectedAreas.filter((a) => a.name !== selected.name)
        : [...this.selectedAreas, selected];

      this.selectedAreas.sort((a, b) => a.name.localeCompare(b.name));
      const coordinates = await this.fetchCoords(selected.name);
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
