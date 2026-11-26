export const SEVERITY = {
  violation: 'http://www.w3.org/ns/shacl#Violation',
  warning: 'http://www.w3.org/ns/shacl#Warning',
  info: 'http://www.w3.org/ns/shacl#Info',
  // The validation service also reports passed checks, with severity shn:Debug.
  passed: 'https://schemas.link/shacl-next#Debug',
};

// The labels of the checks (validation shapes), in display order.
export const CHECK_LABELS: Record<string, string> = {
  besluitenlijstFound: 'Besluitenlijst gekoppeld',
  agendaFound: 'Agenda gekoppeld',
  notulenFound: 'Notulen gekoppeld',
  published: 'Gepubliceerd',
  publicationDateKnown: 'Publicatiedatum gekend',
  publishedOnTime: 'Tijdig gepubliceerd',
  sessionLinksWithADocument: 'Zitting koppelt het document',
  sessionLinksWithExpectedDocumentURI: 'Gekoppeld met de verwachte URI',
};

// From worst to best.
export const SEVERITY_ORDER = [
  SEVERITY.violation,
  SEVERITY.warning,
  SEVERITY.info,
  SEVERITY.passed,
];

export type SeverityDisplay = { skin: string; icon: string; label: string };

export const SEVERITY_DISPLAY: Record<string, SeverityDisplay> = {
  [SEVERITY.violation]: { skin: 'error', icon: 'cross', label: 'Fout' },
  [SEVERITY.warning]: {
    skin: 'warning',
    icon: 'alert-triangle',
    label: 'Waarschuwing',
  },
  [SEVERITY.info]: { skin: 'default', icon: 'info-circle', label: 'Info' },
  [SEVERITY.passed]: { skin: 'success', icon: 'check', label: 'In orde' },
};
