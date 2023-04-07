import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import d3 from "d3";

interface ArgsInterface {}

export default class VoteOverview extends Component<ArgsInterface> {
  @tracked pie = {
    label: {
      format: function (value, ratio, id) {
        return value;
      },
    },
  };

  @tracked tooltip = {
    format: {
      title: (d) => {
        return "Data " + d;
      },
      value: (value, ratio, id) => {
        var format = id === "data1" ? d3.format(",") : d3.format("$");
        return format(value);
      },
    },
  };

  @tracked data = {
    columns: [
      ["Voor", 80],
      ["Tegen", 40],
      ["Onthouden", 10],
    ],
    type: "pie",
  };
  // the three color levels for the percentage values
  color = {
    pattern: ["#B2CCEF", "#F1AEAE", "#b1dcbb"],
    // threshold: {
    //   values: [30, 60, 90, 100],
    // },
  };

  // chart title
  title = { text: "Openbare stemming" };
}
