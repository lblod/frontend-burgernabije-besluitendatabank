import Component from '@glimmer/component';

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
}
