import Component from "@glimmer/component";

interface ArgsInterface {
  municipalityPlaceholder: string;
  municipalitySelected: string;
  municipalityOnChange: () => void;
  municipalityOptions: Array<any>;
  municipalityAllowClear: boolean;

  keywordPlaceholder: string;
  keywordOnChange: string;

  dateHandleChange: (d: any) => void;
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

  get municipalityOptions() {
    // return an array of strings with municipality.bestuurseenheidnaam.value

    const municipalities = this.args.municipalityOptions
      .map((municipality: any) => municipality.bestuurseenheidnaam.value)
      .reduce((unique, item) => {
        return unique.includes(item) ? unique : [...unique, item];
      }, []);
    console.log(municipalities);

    return municipalities;
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

  get endDate() {
    return this.args.endDate;
  }

  get dateHandleChange() {
    return this.args.dateHandleChange;
  }
}
