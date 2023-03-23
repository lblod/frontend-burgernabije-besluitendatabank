import { isAfter, parseISO } from "date-fns";
import ENV from "frontend-burgernabije-besluitendatabank/config/environment";

export default function () {
  this.urlPrefix = ENV.API_URL; // make this `http://localhost:8080`, for example, if your API is on a different server
  this.namespace = "/api"; // make this `/api`, for example, if your API is namespaced
  this.timing = 250; // delay for each request, automatically set to 0 during testing;

  // Uncomment this to let mirage pass through the requests to vlaanderen api
  this.passthrough("https://api.basisregisters.vlaanderen.be/**");
  this.passthrough(
    "https://tni.widgets.burgerprofiel.dev-vlaanderen.be/api/v1/widget/7eed3599-96aa-435b-bc43-fe13d2fc0531"
  );
  this.passthrough(
    "https://tni.widgets.burgerprofiel.dev-vlaanderen.be/api/v1/widget/7eed3599-96aa-435b-bc43-fe13d2fc0531"
  );
  this.passthrough("https://burgernabije-besluitendatabank-dev.s.redhost.be");

  this.get("/agenda-items", function (schema, request) {
    let qp = request.queryParams;
    const {
      page,
      limit,
      startDate,
      municipality,
    }: { page: number; limit: number; startDate: any; municipality: string } =
      qp;
    let agenda_items;

    if (qp && JSON.stringify(qp) !== "{}") {
      if (municipality) {
        agenda_items = schema.agenda_items.where({
          municipality: municipality,
        });
      } else agenda_items = schema.agenda_items.all();
      if (startDate) {
        agenda_items = agenda_items.filter((item) =>
          isAfter(parseISO(item.startdate), parseISO(startDate))
        );
      }
      if (page) {
        let start: number = page * limit;
        let end: number = start + Number(limit);

        console.log(start);
        console.log(end);
        return agenda_items.slice(start, end);
      }
      return agenda_items;
    }
  });

  this.get("/agenda_items/:id", (schema, { params }) => {
    return schema.agenda_items.find(params.id);
  });
}
