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
import type ConceptModel from 'frontend-burgernabije-besluitendatabank/models/concept';
import type GeoPointModel from 'frontend-burgernabije-besluitendatabank/models/geo-point';
import proj4 from 'proj4';
import type ZoneModel from 'frontend-burgernabije-besluitendatabank/models/zone';
import type MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import type Store from '@ember-data/store';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

type LatLngPoint = { lat: number; lng: number };
type LambertCoord = [number, number];

interface JsonApiResource {
  id: string;
  type: string;
  attributes: Record<string, string>;
  relationships?: Record<string, string>;
}

interface JsonApiResponse {
  data: JsonApiResource[];
  included?: JsonApiResource[];
}

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

  declare model: {
    applicantTypes: Array<ConceptModel>;
    reasons: Array<TravelReasonOption>;
    geoPoints: Array<GeoPointModel>;
    zones: Array<ZoneModel>;
  };

  @tracked zoom = 14;
  @tracked lat = 0;
  @tracked lng = 0;
  @tracked step = this.firstStep;
  @tracked selectedGovernment: GoverningBodyOption[] = [];
  @tracked areas: Area[] = [];
  @tracked entityTypes: Array<ConceptModel> = this.model.applicantTypes;
  @tracked travelReasons: TravelReasonOption[] = this.model.reasons;
  @tracked selectedAreas: Area[] = [];
  @tracked selectedEntityType: EntityOption | null = null;
  @tracked selectedTravelReason: TravelReasonOption | null = null;
  @tracked isFormSubmitted: boolean = false;
  @tracked isLoading: boolean = false;

  @service declare governmentList: GovernmentListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare municipalityList: MunicipalityListService;
  @service declare store: Store;

  private abortController?: AbortController;

  get isFirstStep() {
    return this.step === this.firstStep;
  }

  get isLastStep() {
    return this.step === this.lastStep;
  }
  get canGoToNextStep() {
    if (this.step === 0) {
      return false;
    }
    if (this.step === 1) {
      return false;
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
      this.defineProj4();
      await Promise.all(
        this.selectedGovernment.map((municipality) =>
          this.processMunicipality(municipality),
        ),
      );
    } catch (error: unknown) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private defineProj4() {
    proj4.defs(
      'EPSG:31370',
      '+proj=lcc +lat_1=49.8333339 +lat_2=51.16666723333333 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +units=m +no_defs',
    );
  }

  private async processMunicipality(municipality: GoverningBodyOption) {
    const municipalityId = await this.municipalityList.getLocationIdsFromLabels(
      municipality.label,
    );
    const governingBodies = (await this.store
      .adapterFor('governing-body')
      .query(this.store, this.store.modelFor('governing-body'), {
        filter: {
          'administrative-unit': {
            location: {
              ':id:': municipalityId.join(','),
            },
          },
          classification: {
            label: 'Gemeenteraad',
          },
        },
        sort: '-sessions.has-excerpt.created-on',
        include:
          'classification,has-time-specializations.sessions.has-excerpt,sessions.has-excerpt,is-time-specialization-of.sessions.has-excerpt',
        page: { size: 400 },
      })) as JsonApiResponse;

    const excerpts = (governingBodies.included ?? []).filter(
      (item): item is JsonApiResource => item.type === 'uittreksels',
    );

    const allLinks: string[] = excerpts.flatMap(
      (item) => item.attributes['alternate-link'] ?? [],
    );
    if (!allLinks.length) return;
    await this.processZones(municipality, allLinks[0]);
  }

  private async processZones(
    municipality: GoverningBodyOption,
    publicationLink?: string,
  ) {
    const zones = (await this.store.query('zone', {
      include: 'geo-point',
      filter: {
        ':or:': {
          'publication-link': publicationLink,
        },
      },
    })) as AdapterPopulatedRecordArrayWithMeta<ZoneModel>;

    for (const zone of zones.slice()) {
      await this.processZone(municipality, zone);
    }
  }

  private async processZone(
    municipality: GoverningBodyOption,
    zone: ZoneModel,
  ) {
    const geoPoint = await zone.geoPoint;
    const coordinatesString = geoPoint.coordinates;
    if (!coordinatesString) return;
    const coordinates = this.parseWKTPolygon(coordinatesString);
    const coords4326: LatLngPoint[] = coordinates.map(([x, y]) => {
      const [lon, lat]: [number, number] = proj4('EPSG:31370', 'EPSG:4326', [
        x,
        y,
      ]);
      return { lat, lng: lon };
    });
    if (zone.label) {
      this.areas.push(
        new Area({
          name: `${municipality.label} - ${zone.label}`,
          municipality: municipality.label,
          coordinates: coords4326,
        }),
      );
      if (coords4326[0]) {
        this.lat = coords4326[0].lat;
        this.lng = coords4326[0].lng;
        this.zoom = 13;
      }
    }
  }

  parseWKTPolygon(wkt: string): LambertCoord[] {
    const match = wkt.match(/POLYGON\(\(([^)]+)\)\)/);
    if (!match?.[1]) throw new Error('Invalid WKT POLYGON format');

    const coordPairs = match[1].split(',');

    return coordPairs.map((pair) => {
      const [xStr, yStr] = pair.trim().split(/\s+/);
      return [parseFloat(xStr ?? '0'), parseFloat(yStr ?? '0')];
    });
  }

  @action
  async setEntityType(value: EntityOption) {
    this.selectedEntityType = value;
  }

  @action
  setTravelReason(value: TravelReasonOption) {
    this.selectedTravelReason = value;
  }

  @action
  async fetchCoords(label: string, signal?: AbortSignal): Promise<LatLngPoint> {
    const query = encodeURIComponent(label);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const res = await fetch(url, {
      signal,
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
      this.zoom = 14;
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
