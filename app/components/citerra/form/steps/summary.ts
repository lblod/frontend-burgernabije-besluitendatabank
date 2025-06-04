import Component from '@glimmer/component';
import type { GoverningBodyOption } from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';

interface ArgsInterface {
  selectedGovernment: GoverningBodyOption[];
}

export default class Accordion extends Component<ArgsInterface> {
  get totalCost() {
    return (this.args.selectedGovernment.length ?? 0) * 150;
  }
}
