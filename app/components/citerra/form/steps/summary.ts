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
  // Placeholder for future logic
  get totalCost() {
    return 0;
  }

  /**
   * Filters and returns unique descriptions by requesterType.
   */
  private getUniqueDescriptions(requirements: Requirement[]): string[] {
    const seen = new Set<string>();
    return requirements.reduce((descriptions: string[], req) => {
      if (!seen.has(req.requesterType)) {
        seen.add(req.requesterType);
        descriptions.push(req.description ?? '');
      }
      return descriptions;
    }, []);
  }

  /**
   * Returns a list of mapped government info, including conditions and other filtered data.
   */
  get mappedGovernmentInfo() {
    return this.args.selectedGovernment.map((gov) => {
      const { label } = gov;

      const govRequirements = this.args.requirements.filter(
        (req) => req.adminUnit === label,
      );

      const govZones = this.args.selectedAreas.filter(
        (area) => area.municipality === label,
      );

      return {
        ...gov,
        conditions: this.getUniqueDescriptions(govRequirements),
        requiredProof: govRequirements,
        didFindInfoAboutGov: govRequirements.length > 0,
        zones: govZones,
      };
    });
  }
}
