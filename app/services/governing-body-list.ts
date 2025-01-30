import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { QueryParameterKeys } from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import { deserializeArray } from 'frontend-burgernabije-besluitendatabank/utils/query-params';
import type MunicipalityListService from './municipality-list';
import type GoverningBodyModel from 'frontend-burgernabije-besluitendatabank/models/governing-body';
import type GoverningBodyClasssificationCodeModel from 'frontend-burgernabije-besluitendatabank/models/governing-body-classification-code';
import type { AdapterPopulatedRecordArrayWithMeta } from 'frontend-burgernabije-besluitendatabank/utils/ember-data';
import type GovernmentListService from './government-list';

export default class GoverningBodyListService extends Service {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare municipalityList: MunicipalityListService;
  @service declare governmentList: GovernmentListService;
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

    const governingBodies = await this.governingBodies();

    const governingBodyLabelsArray = Array.isArray(governingBodyLabels)
      ? governingBodyLabels
      : deserializeArray(governingBodyLabels);
    const governingBodyClassificationIds = governingBodies.reduce(
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

  @tracked selectedGoverningBodyClassifications: Array<{
    label: string;
    id: string;
    type: 'governing-body-classifications';
  }> = [];

  async governingBodies() {
    const municipalityLabels = this.governmentList.selectedLocalGovernments.map(
      (localGovernment) => localGovernment.label,
    );
    if (municipalityLabels && municipalityLabels.length > 0) {
      const municipalityIds =
        await this.municipalityList.getLocationIdsFromLabels(
          municipalityLabels,
        );

      const govBodies = await this.store.query('governing-body', {
        filter: {
          'administrative-unit': {
            location: { ':id:': municipalityIds.join(',') },
          },
        },
        include: 'classification',
        page: { size: 100 },
      });

      return this.getUniqueGoverningBodies(govBodies).sort((a, b) =>
        a.label.localeCompare(b.label),
      );
    }

    const governingBodyClassifications = await this.store.query(
      'governing-body-classification-code',
      { page: { size: 100 }, sort: 'label' },
    );
    return this.getUniqueClassifications(governingBodyClassifications).sort(
      (a, b) => a.label.localeCompare(b.label),
    );
  }

  getUniqueGoverningBodies(
    govBodies: AdapterPopulatedRecordArrayWithMeta<GoverningBodyModel>,
  ) {
    const uniqueLabels = new Set();

    return govBodies
      .filter((govBody) => {
        const label = govBody.classification.get('label');
        if (label && !uniqueLabels.has(label)) {
          uniqueLabels.add(label);
          return true;
        }
        return false;
      })
      .map((govBody) => ({
        id: govBody.classification.get('id') ?? '',
        label: govBody.classification.get('label') ?? '',
        type: QueryParameterKeys.governingBodies,
      }));
  }

  getUniqueClassifications(
    classifications: AdapterPopulatedRecordArrayWithMeta<GoverningBodyClasssificationCodeModel>,
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
