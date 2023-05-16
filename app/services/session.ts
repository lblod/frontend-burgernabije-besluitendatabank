import DS from "ember-data";

export default DS.Model.extend({
  title: DS.attr("string"),
  date: DS.attr("date"),
  location: DS.attr("string"),
  agendaItems: DS.hasMany("agenda-item"),
});
