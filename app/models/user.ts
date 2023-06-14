/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import Model, { attr, hasMany } from "@ember-data/model";

export default class GebruikerModel extends Model {
  @attr name: string | undefined;
  @attr surName: string | undefined;
  @attr idNumber: string | undefined;
  @hasMany("account", { inverse: null }) account: any;
  @hasMany("governingBody") governingBody: any;

  // used for mock login
  get fullName() {
    return `${this.name} ${this.surName}`.trim();
  }
}
