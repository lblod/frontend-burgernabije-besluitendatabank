import Component from "@glimmer/component";
interface ArgsInterface {
  id: string;
  title: string;
  body: string;
  approvedDate?: Date;
  startDate?: Date;
  endDate?: Date;
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
    return this.args.startDate;
  }

  get endDate() {
    return this.args.endDate;
  }
}
