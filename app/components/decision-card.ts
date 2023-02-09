import Component from "@glimmer/component";
import { format, parseISO } from "date-fns";

interface ArgsInterface {
  id: string;
  title: string;
  body: string;
  approvedDate: string;
  startDate: string;
  endDate: string;
  municipality: string;
}

export default class DecisionCard extends Component<ArgsInterface> {
  get id() {
    return this.args.id;
  }
  get title() {
    return this.args.title;
  }
  get body() {
    return this.args.body;
  }

  get startDate() {
    return format(parseISO(this.args.startDate), "dd/MM/yyyy");
  }

  get endDate() {
    return format(parseISO(this.args.endDate), "dd/MM/yyyy");
  }

  get municipality() {
    return this.args.municipality;
  }
}
