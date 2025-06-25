import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type ZoneModel from './zone';

export default class GeoPointModel extends Model {
  @attr asWKT?: string;
  @attr coordinates?: string;

  @belongsTo('zone', { inverse: null, async: true })
  declare zone: AsyncBelongsTo<ZoneModel>;
}

declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    'geo-point': GeoPointModel;
  }
}
