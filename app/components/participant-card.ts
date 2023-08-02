import Component from '@glimmer/component';

interface ArgsInterface {
  person: {
    start: string;
    eind: string;
    achternaam: string;
    voornaam: string;
    fractie: string;
    bestuursfuncties: string;
    bestuursclassificatie: string;
    beleidsdomeins: string;
  };
}

export default class ParticipantCard extends Component<ArgsInterface> {
  get person() {
    return this.args.person;
  }
}
