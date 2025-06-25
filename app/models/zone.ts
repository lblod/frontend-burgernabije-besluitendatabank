import Model, { attr, belongsTo, type AsyncBelongsTo } from '@ember-data/model';
import type GeoPointModel from './geo-point';

export default class ZoneModel extends Model {
  @attr label?: string;

  @belongsTo('geo-point', { inverse: null, async: true }) // ✅ FIXED HERE
  declare geoPoint: AsyncBelongsTo<GeoPointModel>;
}
declare module 'ember-data/types/registries/model' {
  export default interface ModelRegistry {
    zone: ZoneModel;
  }
}
