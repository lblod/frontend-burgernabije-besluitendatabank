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

export default class VoteOverview extends Component<ArgsInterface> {
  get formattedTableVote() {
    const formattedTableVote: FormattedTableVote[] = [];
    const vote = this.args.vote;

    // add the votes to formattedTableVote in the form of [{proponent: {proponent1}, opponent: {oponent1}, abstainer: {abstainer1}},{proponent: {proponent2}, opponent: {oponent2}, abstainer: {abstainer2}},... ]
    // iterate over all 3 arrays (proponent, opponent, abstainer) and push only one voter to the formattedTableVote array each iteration
    // this means that the length of the formattedTableVote array will be the length of the longest array (proponent, opponent, abstainer)
    // if there is no voter, push an empty object

    const proponents = vote.hasProponents.toArray();
    const opponents = vote.hasOpponents.toArray();
    const abstainers = vote.hasAbstainers.toArray();

    // get the length of the longest array (not the accumaleted length of all 3 arrays)
    const longestArrayLength = Math.max(
      proponents?.length || 0,
      opponents?.length || 0,
      abstainers?.length || 0
    );

    // iterate over the longest array
    for (let i = 0; i < longestArrayLength; i++) {
      // push the proponent, opponent and abstainer of the current iteration to the formattedTableVote array
      formattedTableVote.push({
        proponent: proponents?.[i] || null,
        opponent: opponents?.[i] || null,
        abstainer: abstainers?.[i] || null,
      });
    }
    return formattedTableVote;
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
