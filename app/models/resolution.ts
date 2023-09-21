import Model, { AsyncHasMany, attr, hasMany } from '@ember-data/model';
import ArticleModel from './article';

export default class ResolutionModel extends Model {
  @attr('string') declare title?: string;
  @attr('string') declare value?: string;

  @hasMany('articles', { async: true })
  declare articles: AsyncHasMany<ArticleModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    resolution: ResolutionModel;
  }
}
