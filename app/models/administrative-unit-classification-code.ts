import Model, { attr } from '@ember-data/model';

export default class AdministrativeUnitClassificationCodeModel extends Model {
  @attr('string') declare label: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'administrative-unit-classification-code': AdministrativeUnitClassificationCodeModel;
  }
}
