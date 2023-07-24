import Model, { attr } from '@ember-data/model';

export default class ResolutionModel extends Model {
  @attr('string') declare title?: string;
  @attr('string') declare value?: string;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    resolution: ResolutionModel;
  }
}
