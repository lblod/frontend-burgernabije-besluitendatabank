import Component from "@glimmer/component";

interface ArgsInterface {
  municipalityPlaceholder: string;
  municipalitySelected: string;
  municipalityOnChange: () => void;
  municipalityOptions: Array<any>;
  municipalityAllowClear: boolean;

  keywordPlaceholder: string;
  keywordOnChange: string;

  applyDatePicker: () => any;
  hideDatePicker: () => any;
  cancelDatePicker: () => any;
  startDate: any;
  endDate: any;
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

  get applyDatePicker() {
    return this.args.applyDatePicker;
  }

  get hideDatePicker() {
    return this.args.hideDatePicker;
  }

  get cancelDatePicker() {
    return this.args.cancelDatePicker;
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

  get startDate() {
    return this.args.startDate;
  }

  get municipalityOptions() {
    const municipalities = this.args.municipalityOptions
      .map((municipality: any) => municipality)
      .reduce((unique, item) => {
        return unique.includes(item) ? unique : [...unique, item];
      }, []);

    return municipalities;
  }

  get endDate() {
    return this.args.endDate;
  }
}
