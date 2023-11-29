import Store from '@ember-data/store';
import Service, { service } from '@ember/service';

export default class GoverningBodyListService extends Service {
  @service declare store: Store;

  async getGoverningBodyClassificationIdsFromLabels(
    governingBodyIds?: Array<string> | string
  ): Promise<string | undefined> {
    // return either the string or a string of comma separated ids
    if (!governingBodyIds) {
      return undefined;
    }

    const governingBodies = await this.governingBodies();

    const governingBodyIdsArray = Array.isArray(governingBodyIds)
      ? governingBodyIds
      : governingBodyIds.split('+');

    const governingBodyClassificationIds = governingBodies.reduce(
      (acc, governingBody) => {
        if (governingBodyIdsArray.includes(governingBody.label)) {
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
