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
