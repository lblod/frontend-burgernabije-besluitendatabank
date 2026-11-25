import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type { PublicationStatus } from 'frontend-burgernabije-besluitendatabank/components/publication-pill';
import type { LinkStatus } from 'frontend-burgernabije-besluitendatabank/components/link-pill';

interface Signature {
  Args: { session: SessionModel };
}

type DocumentRow = {
  label: string;
  publicationDate: string | null;
  publicationStatus: PublicationStatus;
  linkStatus: LinkStatus;
};

// TODO - remove show from the session
const DOCUMENTS: DocumentRow[] = [
  {
    label: 'Agenda',
    publicationDate: null,
    publicationStatus: 'not-published',
    linkStatus: 'not-linked',
  },
  {
    label: 'Besluitenlijst',
    publicationDate: '21-10-2026',
    publicationStatus: 'on-time',
    linkStatus: 'linked',
  },
  {
    label: 'Notulen',
    publicationDate: '21-10-2026',
    publicationStatus: 'late',
    linkStatus: 'linked',
  },
];

// The sortable headers hand us the dasherized field name.
const SORT_KEYS: Record<string, keyof DocumentRow> = {
  label: 'label',
  'publication-date': 'publicationDate',
  'link-status': 'linkStatus',
};

export default class SessionPublicationDuty extends Component<Signature> {
  @tracked sort = '';

  get rows(): DocumentRow[] {
    if (!this.sort) {
      return DOCUMENTS;
    }

    const descending = this.sort.startsWith('-');
    const key = SORT_KEYS[descending ? this.sort.slice(1) : this.sort];
    if (!key) {
      return DOCUMENTS;
    }

    const sorted = [...DOCUMENTS].sort((a, b) => {
      return (a[key] ?? '').localeCompare(b[key] ?? '');
    });

    if (descending) {
      sorted.reverse();
    }

    return sorted;
  }
}
