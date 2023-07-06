import Component from '@glimmer/component';
import { format } from 'date-fns';

interface ArgsInterface {
  item: any;
  endDate: any;
  startDate: any;
}

export default class DecisionCard extends Component<ArgsInterface> {
  get item() {
    return this.args.item ? this.args.item : null;
  }

  get startDate() {
    return this.args.startDate
      ? format(this.args.startDate, 'dd/MM/yyyy')
      : null;
  }

  get endDate() {
    return this.args.endDate ? format(this.args.endDate, 'dd/MM/yyyy') : null;
  }

  get dateRange() {
    if (!this.endDate && !this.startDate) return undefined;
    if (!this.endDate) return this.startDate;
    if (!this.startDate) return this.endDate;

    if (this.startDate != this.endDate) {
      return this.startDate + ' tot ' + this.endDate;
    } else {
      return this.endDate;
    }
  }
}
