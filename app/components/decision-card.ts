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
    return this.args.id ? this.args.id : "No id";
  }
  get title() {
    return this.args.title ? this.args.title : "No title";
  }
  get body() {
    return this.args.body;
  }

  get startDate() {
    return this.args.startDate
      ? format(parseISO(this.args.startDate), "dd/MM/yyyy")
      : null;
  }

  get endDate() {
    return this.args.endDate
      ? format(parseISO(this.args.endDate), "dd/MM/yyyy")
      : null;
  }

  get municipality() {
    return this.args.municipality ? this.args.municipality : "No municipality";
  }
}
