import Component from "@glimmer/component";
import { format, parseISO } from "date-fns";

interface ArgsInterface {
  id: string;
  title: string;
  description: string;
  approvedDate: string;
  startDate: Date;
  endDate: Date;
  municipality: string;
}

export default class DecisionCard extends Component<ArgsInterface> {
  get id() {
    return this.args.id ? this.args.id : "No id";
  }
  get title() {
    return this.args.title ? this.args.title : "No title";
  }
  get description() {
    return this.args.description;
  }

  get startDate() {
    return this.args.startDate
      ? format(this.args.startDate, "dd/MM/yyyy")
      : null;
  }

  get endDate() {
    return this.args.endDate
      ? format(this.args.endDate, "dd/MM/yyyy")
      : null;
  }

  get dateRange() {
    if (!this.endDate && !this.startDate) return undefined;
    if (!this.endDate) return this.startDate;
    if (!this.startDate) return this.endDate

    if (this.startDate != this.endDate) {
        return this.startDate + " tot " + this.endDate;
    } else {
        return this.endDate;
    }
}

  get municipality() {
    return this.args.municipality ? this.args.municipality : null;
  }
}
