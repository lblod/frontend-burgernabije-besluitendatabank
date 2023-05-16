import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import d3 from "d3";

interface ArgsInterface {
  neutral?: number;
  for?: number;
  against?: number;
}

export default class VoteOverview extends Component<ArgsInterface> {
  get neutral() {
    console.log(this.args);
    return this.args.neutral ? this.args.neutral : 0;
  }

  get for() {
    return this.args.for ? this.args.for : 0;
  }

  get against() {
    return this.args.against ? this.args.against : 0;
  }
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
      ["Voor", this.for],
      ["Tegen", this.against],
      ["Onthouden", this.neutral],
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
