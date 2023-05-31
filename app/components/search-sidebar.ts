import Component from "@glimmer/component";

interface ArgsInterface {
  municipalityPlaceholder: string;
  municipalityOnChange: () => void;
  municipalityOptions: Array<any>;
  municipalityAllowClear: boolean;

  keywordPlaceholder: string;
  keywordOnChange: string;

  applyDatePicker: () => any;
  hideDatePicker: () => any;
  cancelDatePicker: () => any;
  
  
  valueMunicipality: string;
  valueKeyword: any;
  valueStartDate: any;
  valueEndDate: any;
}

export default class SearchSidebar extends Component<ArgsInterface> {
  get municipalityPlaceholder() {
    return this.args.municipalityPlaceholder;
  }
  get valueMunicipality() {
    return this.args.valueMunicipality;
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
    console.log(this.args);
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

  get valueKeyword() {
    return this.args.valueKeyword;
  }

  get valueStartDate() {
    return this.args.valueStartDate.replace(/-/g, "");
  }

  get municipalityOptions() {
    const municipalities = this.args.municipalityOptions
      .map((municipality: any) => municipality)
      .reduce((unique, item) => {
        return unique.includes(item) ? unique : [...unique, item];
      }, []);
    console.log(municipalities);

    return municipalities;
  }

  get valueEndDate() {
    return this.args.valueEndDate.replace(/-/g, "");
  }
}
