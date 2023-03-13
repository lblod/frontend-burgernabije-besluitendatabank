import faker from "faker";
import { Factory } from "miragejs";
import { municipalities } from "../mockdata";
export default Factory.extend({
  id() {
    return faker.datatype.uuid();
  },
  title() {
    return faker.helpers.randomize([
      "Politieverordening - Regeling van het verkeer in de Nieuwstraat",
      "Mobiliteit - Tijdelijke verordening op het wegverkeer - Afsluiten Lange Kant op 19-11-21",
      "Mobiliteit - Tijdelijke verordening op het wegverkeer - Dakvernieuwingswerken in opdracht van Volkswoningbouw Herent",
    ]);
  },

  body() {
    //De buurtbewoners van de Nieuwstraat organiseren van 25 tot 29 juli en
    //    van 8 tot 12 augustus 2022, elke dag van 10 tot 18 uur, een speelstraat
    //    in hun straat. Hiervoor wordt de straat, gedeelte van huisnummer 1 tot
    //     nr. 21, afgesloten.
    return faker.lorem.paragraph();
  },

  approveddate() {
    return faker.date.past();
  },

  startdate() {
    return faker.date.past(1);
  },

  enddate() {
    return faker.date.future(1);
  },

  municipality() {
    return faker.helpers.randomize(municipalities);
  },
});
