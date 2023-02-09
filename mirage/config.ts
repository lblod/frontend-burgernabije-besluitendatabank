import { format, parseISO, isAfter, isBefore } from "date-fns";

export default function () {
  this.urlPrefix = "http://localhost:4200"; // make this `http://localhost:8080`, for example, if your API is on a different server
  this.namespace = "/api"; // make this `/api`, for example, if your API is namespaced
  this.timing = 250; // delay for each request, automatically set to 0 during testing;

  // this.get("/items", (schema) => {
  //   console.log(schema.items.all());
  //   return schema.items.all();
  // });

  // Uncomment this to let mirage pass through the requests to vlaanderen api
  this.passthrough("https://api.basisregisters.vlaanderen.be/**");
  //this.passthrough("/municipalities");

  /*
  this.create('municipality', {
    title: "Ayoo"
  });
  */

  /*
  this.get("/municipalities", function(schema, request) {
    console.log("--")
    console.log(schema)
    console.log("--")
    let qp = request.queryParams;
    let items;

    console.log("<<<")
    console.log(schema.municipalities)

    console.log(schema.municipalities)
    console.log("<<<")

    return schema.municipalities.all()

    if (qp && JSON.stringify(qp) !== "{}") {
      let page = parseInt(qp.page);
      let limit = parseInt(qp.limit);
      let municipality = qp.municipality;
      console.log(qp);
      let start = page * limit;
      let end = start + limit;
      console.log("MUNI");
      console.log(municipality);
      if (municipality)
        items = schema.municipalities.where({ municipality: municipality });
      else items = schema.items.all();

      let filtered = items.slice(start, end);
      return filtered;
    } else {
      return { data: items };
    }
  });


 /*
  this.get("https://api.basisregisters.vlaanderen.be/**", function(schema, request) {
    let qp = request.queryParams;
    let items;

    if (qp && JSON.stringify(qp) !== "{}") {
      let page = parseInt(qp.page);
      let limit = parseInt(qp.limit);
      let municipality = qp.municipality;
      console.log(qp);
      let start = page * limit;
      let end = start + limit;
      console.log("MUNI");
      console.log(municipality);
      if (municipality)
        items = schema.municipalities.where({ municipality: municipality });
      else items = schema.items.all();

      let filtered = items.slice(start, end);
      return filtered;
    } else {
      return { data: items };
    }
  });
  */

  this.get("/items", function (schema, request) {
    let qp = request.queryParams;
    let items;

    if (qp && JSON.stringify(qp) !== "{}") {
      let page = parseInt(qp?.page);
      let limit = parseInt(qp?.limit);
      let startDate = qp?.startDate;
      let endDate = parseISO(qp?.endDate);
      let municipality = qp.municipality;
      let start = page * limit;
      let end = start + limit;
      if (municipality)
        items = schema.items.where({ municipality: municipality });
      else items = schema.items.all();
      if (startDate) {
        items = items.filter((item: any) => {
          return isAfter(item.startdate, parseISO(startDate));
        });
      }

      let filtered = items.slice(start, end);
      return filtered;
    } else {
      return { data: items };
    }
  });

  this.get("/items/:id", (schema, { params }) => {
    return schema.items.find(params.id);
  });
}
