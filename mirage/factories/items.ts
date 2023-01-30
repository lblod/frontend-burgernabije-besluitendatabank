import { Factory } from "miragejs";
import faker from "faker";

export default Factory.extend({
  id() {
    return faker.hacker.uuid();
  },
  title() {
    return faker.lorem.sentence();
  },

  body() {
    return faker.lorem.paragraph();
  },

  approvedData() {
    return faker.date.past();
  },

  startDate() {
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
