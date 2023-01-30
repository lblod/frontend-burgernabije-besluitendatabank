export default function () {
  this.urlPrefix = "http://localhost:4200/"; // make this `http://localhost:8080`, for example, if your API is on a different server
  this.namespace = "api"; // make this `/api`, for example, if your API is namespaced
  this.timing = 200; // delay for each request, automatically set to 0 during testing;

  this.get("/items", (schema) => {
    console.log(schema.items.all());
    return schema.items.all();
  });
}
