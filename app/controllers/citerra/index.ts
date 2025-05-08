import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type { GoverningBodyOption } from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type { LocalGovernmentType } from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import {
  type AreaParams,
  type EntityOption,
  type TravelReasonOption,
} from './types';
import { defaultEntityTypes, defaultTravelReasons } from './data';

export default class AgendaItemsIndexController extends Controller {
  firstStep = 0;
  lastStep = 3;
  zoom = 14;

  @tracked lat = 0;
  @tracked lng = 0;
  @tracked step = this.firstStep;
  @tracked selectedGovernment: GoverningBodyOption | null = null;
  @tracked areas: Area[] = [];
  @tracked entityTypes = defaultEntityTypes;
  @tracked travelReasons: TravelReasonOption[] = defaultTravelReasons;
  @tracked selectedAreas: Area[] = [];
  @tracked selectedEntityType: EntityOption | null = null;
  @tracked selectedTravelReason: TravelReasonOption | null = null;
  @tracked isFormSubmitted: boolean = false;

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
    console.log({
      selectedGovernment: this.selectedGovernment,
      selectedAreas: this.selectedAreas,
      selectedEntityType: this.selectedEntityType,
      selectedTravelReason: this.selectedTravelReason,
    });
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
  async setGovernment(newOptions: {
    label: string;
    id: string;
    type: LocalGovernmentType;
  }) {
    this.selectedGovernment = newOptions;
    this.selectedAreas = [];
    await this.getCoordinates();
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
    if (!this.selectedGovernment) {
      throw new Error('No government selected');
    }
    const encoded = encodeURIComponent(this.selectedGovernment.label);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
    });

    const data = await response.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];
      this.lat = parseFloat(lat);
      this.lng = parseFloat(lon);
      this.generateRandomZones();
    } else {
      throw new Error('Location not found');
    }
  }

  generateRandomZones() {
    const numZones = 2 + Math.floor(Math.random() * 3);
    const zones = [];
    const offsetScale = 0.002;

    for (let z = 0; z < numZones; z++) {
      const numPoints = Math.floor(Math.random() * 8) + 8;
      const angleStep = (2 * Math.PI) / numPoints;
      const baseLat = this.lat + (Math.random() - 0.5) * 0.01;
      const baseLng = this.lng + (Math.random() - 0.5) * 0.01;
      const points = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        const radius = offsetScale + Math.random() * offsetScale;
        points.push({
          lat: baseLat + radius * Math.sin(angle),
          lng: baseLng + radius * Math.cos(angle),
        });
      }

      zones.push(
        new Area({
          name: `Zone ${z + 1}`,
          coordinates: points,
        }),
      );
    }

    this.areas = zones;
  }
  @action
  selectAreas(selected: Area[] | Area) {
    if (Array.isArray(selected)) {
      const uniqueNames = new Set();
      this.selectedAreas = selected
        .filter((a) => {
          if (uniqueNames.has(a.name)) return false;
          uniqueNames.add(a.name);
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    } else {
      const exists = this.selectedAreas.some((a) => a.name === selected.name);

      this.selectedAreas = exists
        ? this.selectedAreas.filter((a) => a.name !== selected.name)
        : [...this.selectedAreas, selected];

      this.selectedAreas.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  @action
  isAreaSelected(area: Area): boolean {
    return this.selectedAreas.some((a) => a.name === area.name);
  }
}

class Area {
  @tracked name: string;
  @tracked coordinates: { lat: number; lng: number }[];

  constructor({ name, coordinates }: AreaParams) {
    this.name = name;
    this.coordinates = coordinates;
  }
}
