import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type { LinkStatus } from 'frontend-burgernabije-besluitendatabank/components/link-pill';

interface Signature {
  Args: { session: SessionModel };
}

type MandatarisRow = {
  mandateType: string;
  name: string;
  linkStatus: LinkStatus;
};

// TODO - remove show from the session
const MANDATARISSEN: MandatarisRow[] = [
  {
    mandateType: 'Voorzitter',
    name: 'Voornaam Achternaam',
    linkStatus: 'not-found',
  },
  {
    mandateType: 'Secretaris',
    name: 'Voornaam Achternaam',
    linkStatus: 'linked',
  },
  {
    mandateType: 'Penningmeester',
    name: 'Voornaam Achternaam',
    linkStatus: 'linked',
  },
  {
    mandateType: 'Gemeenteraadslid',
    name: 'Voornaam Achternaam',
    linkStatus: 'not-linked',
  },
];

const SORT_KEYS: Record<string, keyof MandatarisRow> = {
  'mandate-type': 'mandateType',
  name: 'name',
  'link-status': 'linkStatus',
};

export default class SessionMandatarissen extends Component<Signature> {
  @tracked sort = '';

  get matchedCount() {
    return 10;
  }

  get totalCount() {
    return 14;
  }

  get rows(): MandatarisRow[] {
    if (!this.sort) {
      return MANDATARISSEN;
    }

    const descending = this.sort.startsWith('-');
    let field = this.sort;
    if (descending) {
      field = this.sort.slice(1);
    }

    const key = SORT_KEYS[field];
    if (!key) {
      return MANDATARISSEN;
    }

    const sorted = [...MANDATARISSEN].sort((a, b) => {
      return a[key].localeCompare(b[key]);
    });

    if (descending) {
      sorted.reverse();
    }

    return sorted;
  }
}
