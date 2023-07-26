import Component from '@glimmer/component';
import MandataryModel from 'frontend-burgernabije-besluitendatabank/models/mandatary';
import VoteModel from 'frontend-burgernabije-besluitendatabank/models/vote';

interface ArgsInterface {
  numberOfAbstentions: number;
  numberOfOpponents: number;
  numberOfProponents: number;
  vote: VoteModel;
}

interface FormattedTableVote {
  proponent: MandataryModel | null;
  opponent: MandataryModel | null;
  abstainer: MandataryModel | null;
}

const strokeDashArray = 158;

const sortByFamilyName = (a: MandataryModel, b: MandataryModel) => {
  const aFamilyName = (a?.aliasValue?.familyName || '').toLowerCase();
  const bFamilyName = (b?.aliasValue?.familyName || '').toLowerCase();

  return aFamilyName.localeCompare(bFamilyName);
};

export default class VoteOverview extends Component<ArgsInterface> {
  get abstainers() {
    return this.args.vote.hasAbstainers.toArray().sort(sortByFamilyName);
  }

  get opponents() {
    return this.args.vote.hasOpponents.toArray().sort(sortByFamilyName);
  }

  get proponents() {
    return this.args.vote.hasProponents.toArray().sort(sortByFamilyName);
  }

  get numberOfAbstentions() {
    return this.args.vote.numberOfAbstentions || 0;
  }

  get numberOfOpponents() {
    return this.args.vote.numberOfOpponents || 0;
  }

  get numberOfProponents() {
    return this.args.vote.numberOfProponents || 0;
  }

  private get totalVoters() {
    return (
      this.numberOfAbstentions +
      this.numberOfOpponents +
      this.numberOfProponents
    );
  }

  get numberOfAbstentionsGraphValue() {
    return this.totalVoters > 0
      ? (this.numberOfAbstentions / this.totalVoters) * strokeDashArray
      : 0;
  }

  get numberOfOpponentsGraphValue() {
    return this.totalVoters > 0
      ? (this.numberOfOpponents / this.totalVoters) * strokeDashArray
      : 0;
  }

  get numberOfProponentsGraphValue() {
    return this.totalVoters > 0
      ? (this.numberOfProponents / this.totalVoters) * strokeDashArray
      : 0;
  }
}
