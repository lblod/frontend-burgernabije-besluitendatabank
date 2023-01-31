export default function () {
  this.urlPrefix = "http://localhost:4200/"; // make this `http://localhost:8080`, for example, if your API is on a different server
  this.namespace = "api"; // make this `/api`, for example, if your API is namespaced
  this.timing = 250; // delay for each request, automatically set to 0 during testing;

  // this.get("/items", (schema) => {
  //   console.log(schema.items.all());
  //   return schema.items.all();
  // });

  this.get("/items", function (schema, request) {
    let qp = request.queryParams;
    let items;

    if (qp && JSON.stringify(qp) !== "{}") {
      let page = parseInt(qp.page);
      let limit = parseInt(qp.limit);
      let municipality = qp.municipality;
      console.log(qp);
      let start = page * limit;
      let end = start + limit;
      console.log("MIRAGE");
      console.log(municipality);
      if (municipality)
        items = schema.items.where({ municipality: municipality });
      else items = schema.items.all();

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
