import Store from '@ember-data/store';
import Service, { service } from '@ember/service';

export default class GoverningBodyListService extends Service {
  @service declare store: Store;

  /**
   * Get the governing body classification ids from the given labels.
   * @returns The governing body classifcation ids.
   **/

  async getGoverningBodyClassificationIdsFromLabels(
    governingBodyLabels?: Array<string> | string
  ): Promise<string | undefined> {
    if (!governingBodyLabels) {
      return undefined;
    }

    const governingBodies = await this.governingBodies();

    const governingBodyLabelsArray = Array.isArray(governingBodyLabels)
      ? governingBodyLabels
      : governingBodyLabels.split('+');

    const governingBodyClassificationIds = governingBodies.reduce(
      (acc, governingBody) => {
        if (governingBodyLabelsArray.includes(governingBody.label)) {
          acc.push(governingBody.id);
        }
        return acc;
      },
      [] as Array<string>
    );

    return governingBodyClassificationIds.join(',');
  }

  async governingBodies() {
    const governingBodyClasssificationCodes = await this.store.query(
      'governing-body-classification-code',
      {
        page: { size: 100 },
        sort: 'label',
      }
    );

    return governingBodyClasssificationCodes
      .filter(
        (classificationCode, index, self) =>
          self.findIndex((t) => t.label === classificationCode.label) === index
      )
      .map((governingBody) => ({
        id: governingBody.id,
        label: governingBody.label,
      }));
  }
}
declare module '@ember/service' {
  interface Registry {
    'governing-body-list': GoverningBodyListService;
  }
}
