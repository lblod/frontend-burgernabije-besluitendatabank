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

const sortByFamilyName = (a: MandataryModel, b: MandataryModel) => {
  const aFamilyName = (a?.aliasValue?.familyName || '').toLowerCase();
  const bFamilyName = (b?.aliasValue?.familyName || '').toLowerCase();

  return aFamilyName.localeCompare(bFamilyName);
};

export default class VoteOverview extends Component<ArgsInterface> {
  get proponents() {
    return this.args.vote.hasProponents.toArray().sort(sortByFamilyName);
  }

  get opponents() {
    return this.args.vote.hasOpponents.toArray().sort(sortByFamilyName);
  }

  get abstainers() {
    return this.args.vote.hasAbstainers.toArray().sort(sortByFamilyName);
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

  get numberOfAbstentionsGraphValue() {
    const strokeDashArray = 158;
    const totalValue =
      (this.numberOfProponents || 0) +
      (this.numberOfOpponents || 0) +
      (this.numberOfAbstentions || 0);
    const abstentionsValue = this.numberOfAbstentions || 0;

    return (abstentionsValue / totalValue) * strokeDashArray;
  }

  get numberOfOpponentsGraphValue() {
    const strokeDashArray = 158;
    const totalValue =
      (this.numberOfProponents || 0) +
      (this.numberOfOpponents || 0) +
      (this.numberOfAbstentions || 0);
    const opponentsValue = this.numberOfOpponents || 0;

    return (opponentsValue / totalValue) * strokeDashArray;
  }

  get numberOfProponentsGraphValue() {
    const strokeDashArray = 158;
    const totalValue =
      (this.numberOfProponents || 0) +
      (this.numberOfOpponents || 0) +
      (this.numberOfAbstentions || 0);
    const proponentsValue = this.numberOfProponents || 0;

    return (proponentsValue / totalValue) * strokeDashArray;
  }
}
