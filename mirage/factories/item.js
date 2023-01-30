import { Factory } from "miragejs";
import faker from "faker";

export default Factory.extend({
  id() {
    return faker.datatype.uuid();
  },
  title() {
    //  Politieverordening - Regeling van het verkeer in de Nieuwstraat
    return faker.lorem.sentence();
  },

  body() {
    //De buurtbewoners van de Nieuwstraat organiseren van 25 tot 29 juli en
    //    van 8 tot 12 augustus 2022, elke dag van 10 tot 18 uur, een speelstraat
    //    in hun straat. Hiervoor wordt de straat, gedeelte van huisnummer 1 tot
    //     nr. 21, afgesloten.
    return faker.lorem.paragraph();
  },

  approvedDate() {
    return faker.date.past();
  },

  startData() {
    return faker.date.past();
  },

  endDate() {
    return faker.date.future();
  },

  municipality() {
    return faker.helpers.randomize([
      "Antwerpen",
      "Aalst",
      "Gent",
      "Brugge",
      "Hasselt",
    ]);
  },
});
