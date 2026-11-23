import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type ValidationResultModel from './validation-result';

export default class ValidationShapeModel extends Model {
  @attr('string') declare name?: string;

  @hasMany('validation-result', { async: true, inverse: 'sourceShape' })
  declare results: AsyncHasMany<ValidationResultModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'validation-shape': ValidationShapeModel;
  }
}
