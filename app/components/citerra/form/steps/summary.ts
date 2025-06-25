import Component from '@glimmer/component';
import type {
  AreaParams,
  Requirement,
} from 'frontend-burgernabije-besluitendatabank/controllers/citerra/types';
import type { GoverningBodyOption } from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';

interface ArgsInterface {
  selectedGovernment: GoverningBodyOption[];
  requirements: Requirement[];
  selectedAreas: AreaParams[];
}

export default class Accordion extends Component<ArgsInterface> {
  get totalCost() {
    return 0;
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
    return this.args.selectedGovernment.map((gov) => {
      return {
        ...gov,
        conditions: this.args.requirements.filter(
          (req: Requirement) => req.adminUnit === gov.label,
        ),
        requiredProof: this.args.requirements.filter(
          (req: Requirement) => req.adminUnit === gov.label,
        ),
        didFindInfoAboutGov: this.args.requirements.some(
          (req: Requirement) => req.adminUnit === gov.label,
        ),
        zones: this.args.selectedAreas.filter(
          (area: AreaParams) => area.municipality === gov.label,
        ),
      };
    });
  }
}
