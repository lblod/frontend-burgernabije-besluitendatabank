import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

interface ArgsInterface {}

export default class VoteOverview extends Component<ArgsInterface> {
  @tracked data = {
    columns: [
      ["Voor", 30],
      ["Tegen", 120],
      ["Onthouden", 120],
    ],
    type: "pie",
  };
  // the three color levels for the percentage values
  color = {
    pattern: ["#FF0000", "#F97600", "#F6C600", "#60B044"],
    threshold: {
      values: [30, 60, 90, 100],
    },
  };

  size = {
    height: 180,
  };

  // chart title
  title = { text: "Openbare stemming" };
  padding = { top: 20 };
}
