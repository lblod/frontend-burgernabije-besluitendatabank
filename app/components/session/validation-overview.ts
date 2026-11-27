import Component from '@glimmer/component';

import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type { PublicationStatus } from 'frontend-burgernabije-besluitendatabank/components/publication-pill';

interface Signature {
  Args: { session: SessionModel };
}

type DocumentSummary = {
  label: string;
  publicationStatus: PublicationStatus;
  issueCount: number;
};

type MaturityLevel = {
  level: number;
  percentage: number;
};

// TODO - remove show from the session
const DOCUMENTS: DocumentSummary[] = [
  { label: 'Agenda', publicationStatus: 'not-published', issueCount: 2 },
  { label: 'Besluitenlijst', publicationStatus: 'on-time', issueCount: 0 },
  { label: 'Notulen', publicationStatus: 'on-time', issueCount: 0 },
];

const MATURITY_LEVELS: MaturityLevel[] = [
  { level: 1, percentage: 90 },
  { level: 2, percentage: 100 },
  { level: 3, percentage: 0 },
];

export default class SessionValidationOverview extends Component<Signature> {
  documents = DOCUMENTS;

  maturityLevels = MATURITY_LEVELS;
}
