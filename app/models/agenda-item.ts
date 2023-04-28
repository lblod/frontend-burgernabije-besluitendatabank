import DS from "ember-data";

export default DS.Model.extend({
  alternateLink: DS.attr("string"),
  plannedForPublic: DS.attr("boolean"),
  title: DS.attr("string"),
  relationships: DS.attr(),
  generated: DS.attr(),
  links: DS.attr(),
  related: DS.attr(),
  self: DS.attr(),
  session: DS.attr(),
  type: DS.attr("string"),
});
