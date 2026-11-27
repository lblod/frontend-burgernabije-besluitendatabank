import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type ValidationresultModel from './validationresult';

export default class ValidationshapeModel extends Model {
  @attr('string') declare name?: string;

  @hasMany('validationresult', { async: true, inverse: 'sourceShape' })
  declare validationresults: AsyncHasMany<ValidationresultModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    validationshape: ValidationshapeModel;
  }
}
