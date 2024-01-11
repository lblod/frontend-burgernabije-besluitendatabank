import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class GovernmentListService extends Service {
  @tracked selectedLocalGovernments: Array<{
    label: string;
    id: string;
    type: 'provincies' | 'gemeentes';
  }> = [];
}

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:government-list')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('government-list') declare altName: GovernmentListService;`.
declare module '@ember/service' {
  interface Registry {
    'government-list': GovernmentListService;
  }
}
