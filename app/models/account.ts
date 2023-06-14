import Model, { attr, belongsTo } from "@ember-data/model";

export default class AccountModel extends Model {
  @attr voId: string | undefined;
  @attr provider: string | undefined;
  @belongsTo("user", { inverse: null }) user: any;
}
