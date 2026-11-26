import Model, { attr, hasMany, type AsyncHasMany } from '@ember-data/model';
import type ValidationresultModel from './validationresult';

export default class ReportModel extends Model {
  @attr('boolean') declare conforms?: boolean;
  @attr('date') declare created?: Date;

  @hasMany('validationresult', { async: true, inverse: 'report' })
  declare validationresults: AsyncHasMany<ValidationresultModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    report: ReportModel;
  }
}
