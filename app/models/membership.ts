import Model, { belongsTo } from "@ember-data/model";
import parliamentaryGroupModel from "./parliamentary-group";

export default class MembershipModel extends Model {
  @belongsTo("parliamentary-group", { inverse: null })
  declare innerGroup: parliamentaryGroupModel;
}
