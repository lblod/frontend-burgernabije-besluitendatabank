import Component from '@glimmer/component';
import type { GoverningBodyOption } from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';

interface ArgsInterface {
  selectedGovernment: GoverningBodyOption[];
}

export default class Accordion extends Component<ArgsInterface> {
  get totalCost() {
    const withInfo = this.mappedGovernmentInfo.filter(
      (gov) => gov.didFindInfoAboutGov,
    );
    return (withInfo.length ?? 0) * 150;
  }

  get conditions() {
    return [
      'Zone A is enkel bereikbaar tussen 12-15 uur',
      'Houders van een vergunning mogen de zone betreden met hun voertuig',
      '[lorem ipsum]',
    ];
  }

  get requiredProof() {
    return [
      'Een goedkeuring van de gemeente',
      'Werkgeversattest of bewijs van professionele activiteit binnen de zone',
      '[lorem ipsum]',
    ];
  }

  get mappedGovernmentInfo() {
    return this.args.selectedGovernment.map((gov, index) => {
      return {
        ...gov,
        conditions: this.conditions,
        proof: this.requiredProof,
        didFindInfoAboutGov: index !== 1,
      };
    });
  }
}
