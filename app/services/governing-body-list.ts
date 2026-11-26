import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { QueryParameterKeys } from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import type MunicipalityListService from './municipality-list';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';
import type GovernmentListService from './government-list';
import type FilterService from './filter-service';
import type ProvinceListService from './province-list';
import type MuSearchService from './mu-search';
import type GoverningBodyClassificationCodeModel from 'frontend-burgernabije-besluitendatabank/models/governing-body-classification-code';

export type GoverningBodyOption = {
  id: string;
  label: string;
  type: string;
};

type ClassificationCode = {
  id: string;
  label: string;
};

export default class GoverningBodyListService extends Service {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governmentList: GovernmentListService;
  @service declare filterService: FilterService;
  @service declare muSearch: MuSearchService;

  @tracked selected: GoverningBodyOption[] = [];
  @tracked options: GoverningBodyOption[] = [];
  @tracked isLoading = false;

  private locationOptionsCacheKey?: string;
  private locationOptionsCache?: GoverningBodyOption[];
  private loadToken = 0;

  constructor(...args: []) {
    super(...args);
    this.loadOptions();
  }

  /**
   * Get the governing body classification ids from the given labels.
   * @returns The governing body classifcation ids.
   **/

  async getGoverningBodyClassificationIdsFromLabels(
    governingBodyLabels?: Array<string> | string,
  ): Promise<string | undefined> {
    if (!governingBodyLabels) {
      return undefined;
    }

    const options = await this.loadOptions();

    const governingBodyLabelsArray = Array.isArray(governingBodyLabels)
      ? governingBodyLabels
      : deserializeArray(governingBodyLabels);
    const governingBodyClassificationIds = options.reduce(
      (acc, governingBody) => {
        if (governingBodyLabelsArray.includes(governingBody.label)) {
          acc.push(governingBody.id);
        }
        return acc;
      },
      [] as Array<string>,
    );

    return governingBodyClassificationIds.join(',');
  }

  async loadOptions(): Promise<GoverningBodyOption[]> {
    const token = ++this.loadToken;

    try {
      const {
        municipalityLabels,
        governingBodyClassifications,
        provinceLabels,
      } = this.filterService.filters;

      const hasLocationFilters =
        Boolean(municipalityLabels?.trim()) || Boolean(provinceLabels?.trim());

      if (!hasLocationFilters) {
        const allCodes = await this.store.query(
          'governing-body-classification-code',
          {
            page: { size: 999 },
            sort: 'label',
          },
        );

        if (token !== this.loadToken) return this.options;

        this.options = this.sortOptions(
          this.getUniqueClassifications(allCodes),
        );

        this.restoreSelected(governingBodyClassifications);
        return this.options;
      }

      const locationCacheKey = `${municipalityLabels ?? ''}|${provinceLabels ?? ''}`;
      if (
        this.locationOptionsCacheKey === locationCacheKey &&
        this.locationOptionsCache
      ) {
        this.options = this.locationOptionsCache;
        this.restoreSelected(governingBodyClassifications);
        return this.options;
      }

      this.isLoading = true;

      const [municipalityIds, provinceIds] = await Promise.all([
        municipalityLabels
          ? this.municipalityList.getLocationIdsFromLabels(
              municipalityLabels.replace(',', '+'),
            )
          : Promise.resolve([]),
        provinceLabels
          ? this.provinceList.getProvinceIdsFromLabels(
              provinceLabels.replace(',', '+'),
            )
          : Promise.resolve([]),
      ]);

      const locationIds = [...municipalityIds, ...provinceIds];

      const [governingBodies, allCodes] = await Promise.all([
        this.store.query('governing-body', {
          filter: {
            'administrative-unit': {
              location: { ':id:': locationIds.join(',') },
            },
          },
          include: 'classification,org-classification',
          page: { size: 999 },
        }),
        this.store.query('governing-body-classification-code', {
          page: { size: 999 },
          sort: 'label',
        }),
      ]);

      // Process data
      const bodyOptions = this.getUniqueGoverningBodies(governingBodies);
      const filteredCodes = this.filterByLabel(allCodes, bodyOptions);
      const uniqueCodes = this.uniqueByLabel(filteredCodes);

      const candidateOptions = uniqueCodes.map((item) => ({
        id: item.id,
        label: item.label,
        type: QueryParameterKeys.governingBodies,
      }));

      // Only keep bestuursorganen that actually have sessions
      const options = await this.filterOptionsWithSessions(
        candidateOptions,
        locationIds,
      );

      // A newer load (e.g. another municipality) superseded us; don't overwrite
      // its results or cache with our stale ones.
      if (token !== this.loadToken) return this.options;

      this.options = options;
      this.locationOptionsCacheKey = locationCacheKey;
      this.locationOptionsCache = options;

      this.restoreSelected(governingBodyClassifications);

      return this.options;
    } finally {
      if (token === this.loadToken) {
        this.isLoading = false;
      }
    }
  }

  /**
   * Keeps only the classifications that have at least one session in the given location(s)
   */
  private async filterOptionsWithSessions(
    options: GoverningBodyOption[],
    locationIds: string[],
  ): Promise<GoverningBodyOption[]> {
    if (locationIds.length === 0) {
      return options;
    }

    const hasSessions = await Promise.all(
      options.map(async (option) => {
        const count = await this.muSearch.count('sessions', {
          ':has:search_location_id': 't',
          ':terms:search_location_id': locationIds.join(','),
          ':terms:search_governing_body_classification_id': option.id,
        });
        return count > 0;
      }),
    );

    return options.filter((_, index) => hasSessions[index]);
  }

  private filterByLabel(
    list: AdapterPopulatedRecordArrayWithMeta<GoverningBodyClassificationCodeModel>,
    options: { label: string }[],
  ): ClassificationCode[] {
    return list.filter((item) =>
      options.some((o) => o.label.toLowerCase() === item.label.toLowerCase()),
    );
  }

  private uniqueByLabel(list: ClassificationCode[]): ClassificationCode[] {
    const seen = new Set<string>();
    return list.filter((item) => {
      const key = item.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private restoreSelected(selectedParam?: string) {
    if (!selectedParam) return;

    const labels = selectedParam.split('+');
    this.selected = this.options.filter((opt) => labels.includes(opt.label));

    if (this.selected.length === 0) {
      this.router.transitionTo({ queryParams: { bestuursorganen: null } });
    }
  }

  sortOptions(options: GoverningBodyOption[]): GoverningBodyOption[] {
    return options.sort((a, b) => a.label.localeCompare(b.label));
  }

  getUniqueGoverningBodies(
    govBodies: AdapterPopulatedRecordArrayWithMeta<GoverningBodyModel>,
  ) {
    const uniqueLabels = new Set();

    return govBodies
      .filter((govBody) => {
        const classification = this.resolveClassification(govBody);
        const label = classification.get('label') ?? govBody.name;
        if (label && !uniqueLabels.has(label)) {
          uniqueLabels.add(label);
          return true;
        }
        return false;
      })
      .map((govBody) => {
        const classification = this.resolveClassification(govBody);
        return {
          id: classification.get('id') ?? govBody.id,
          label: classification.get('label') ?? govBody.name,
          type: QueryParameterKeys.governingBodies,
        };
      });
  }

  /**
   * Returns the governing body classification, falling back to the one linked
   * through `org:classification` when `besluit:classificatie` is missing.
   * Some bestuursorganen only carry the former due to a data fault, and would
   * otherwise be dropped from the options list.
   */
  private resolveClassification(govBody: GoverningBodyModel) {
    return govBody.classification.get('label')
      ? govBody.classification
      : govBody.orgClassification;
  }

  getUniqueClassifications(
    classifications: AdapterPopulatedRecordArrayWithMeta<GoverningBodyClassificationCodeModel>,
  ) {
    const uniqueLabels = new Set();

    return classifications
      .filter((classification) => {
        if (!uniqueLabels.has(classification.label)) {
          uniqueLabels.add(classification.label);
          return true;
        }
        return false;
      })
      .map((classification) => ({
        id: classification.id,
        label: classification.label,
        type: QueryParameterKeys.governingBodies,
      }));
  }
}
declare module '@ember/service' {
  interface Registry {
    'governing-body-list': GoverningBodyListService;
  }
}
