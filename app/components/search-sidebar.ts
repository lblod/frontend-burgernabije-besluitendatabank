import Component from "@glimmer/component";
import { format, parseISO } from "date-fns";

interface ArgsInterface {
  municipalityPlaceholder: string;
  municipalitySelected: string;
  municipalityOnChange: () => void;
  municipalityOptions: Array<any>;
  municipalityAllowClear: boolean;

  keywordPlaceholder: string;
  keywordOnChange: string;

  dateHandleChange: () => void;
}

export default class SearchSidebar extends Component<ArgsInterface> {
  get municipalityPlaceholder() {
    return this.args.municipalityPlaceholder;
  }
  get municipalitySelected() {
    return this.args.municipalitySelected;
  }
  get municipalityOnChange() {
    return this.args.municipalityOnChange;
  }

  get municipalityOptions() {
    return this.args.municipalityOptions;
  }

  get municipalityAllowClear() {
    return this.args.municipalityAllowClear;
  }

  get keywordPlaceholder() {
    return this.args.keywordPlaceholder;
  }

  get keywordOnChange() {
    return this.args.keywordOnChange;
  }

  get dateHandleChange() {
    return this.args.dateHandleChange;
  }
}
