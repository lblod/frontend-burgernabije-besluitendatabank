import Model, { AsyncBelongsTo, attr, belongsTo } from '@ember-data/model';
import ResolutionModel from './resolution';

export default class ArticleModel extends Model {
  @attr('string') declare number?: string;
  @attr('string') declare value?: string;

  @belongsTo('resolution', { async: true, inverse: null })
  declare resolution?: AsyncBelongsTo<ResolutionModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    article: ArticleModel;
  }
}
