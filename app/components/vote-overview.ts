import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import * as d3 from 'd3';

interface ArgsInterface {
  numberOfAbstentions: number;
  numberOfOpponents: number;
  numberOfProponents: number;
}

export default class VoteOverview extends Component<ArgsInterface> {
  get numberOfAbstentions() {
    return this.args.numberOfAbstentions || 0;
  }
  get numberOfOpponents() {
    return this.args.numberOfOpponents || 0;
  }
  get numberOfProponents() {
    return this.args.numberOfProponents || 0;
  }

  get numberOfAbstentionsGraphValue() {
    const strokeDashArray = 158;
    const totalValue =
      (this.args.numberOfProponents || 0) +
      (this.args.numberOfOpponents || 0) +
      (this.args.numberOfAbstentions || 0);
    const abstentionsValue = this.args.numberOfAbstentions || 0;

    return (abstentionsValue / totalValue) * strokeDashArray;
  }

  get numberOfOpponentsGraphValue() {
    const strokeDashArray = 158;
    const totalValue =
      (this.args.numberOfProponents || 0) +
      (this.args.numberOfOpponents || 0) +
      (this.args.numberOfAbstentions || 0);
    const opponentsValue = this.args.numberOfOpponents || 0;

    return (opponentsValue / totalValue) * strokeDashArray;
  }

  get numberOfProponentsGraphValue() {
    const strokeDashArray = 158;
    const totalValue =
      (this.args.numberOfProponents || 0) +
      (this.args.numberOfOpponents || 0) +
      (this.args.numberOfAbstentions || 0);
    const proponentsValue = this.args.numberOfProponents || 0;

    return (proponentsValue / totalValue) * strokeDashArray;
  }

  @tracked pie = {
    label: {
      format: function (value: string) {
        return value;
      },
    },
  };

  @tracked tooltip = {
    format: {
      title: (d: string) => {
        return 'Data ' + d;
      },
      value: (value: number, id: string) => {
        const format = id === 'data1' ? d3.format(',') : d3.format('$');
        return format(value);
      },
    },
  };

  @tracked data = {
    columns: [
      ['Voor', this.numberOfProponents],
      ['Tegen', this.numberOfOpponents],
      ['Onthouden', this.numberOfAbstentions],
    ],
    type: 'pie',
  };
  // the three color levels for the percentage values
  color = {
    pattern: ['#007A37', '#AA2729', '#687483'],
    // threshold: {
    //   values: [30, 60, 90, 100],
    // },
  };

  legend = {
    position: 'right',
  };
}
