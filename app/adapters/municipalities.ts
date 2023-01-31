import DS from "ember-data";

export default DS.JSONAPIAdapter.extend({
  host: "https://api.basisregisters.vlaanderen.be",
  namespace: "v2/gemeenten",
  pathForType: function (type: any) {
    return "";
  },
});
