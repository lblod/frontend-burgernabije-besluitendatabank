import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type ValidationReportModel from 'frontend-burgernabije-besluitendatabank/models/validation-report';
import type ValidationResultModel from 'frontend-burgernabije-besluitendatabank/models/validation-result';
import { SEVERITY } from 'frontend-burgernabije-besluitendatabank/models/validation-result';

interface Signature {
  Args: { session: SessionModel };
}

// In display order.
const CHECK_LABELS: Record<string, string> = {
  besluitenlijstFound: 'Besluitenlijst gekoppeld',
  agendaFound: 'Agenda gekoppeld',
  notulenFound: 'Notulen gekoppeld',
  published: 'Gepubliceerd',
  publicationDateKnown: 'Publicatiedatum gekend',
  publishedOnTime: 'Tijdig gepubliceerd',
  sessionLinksWithADocument: 'Zitting koppelt het document',
  sessionLinksWithExpectedDocumentURI: 'Gekoppeld met de verwachte URI',
};

const SEVERITY_ORDER = [
  SEVERITY.violation,
  SEVERITY.warning,
  SEVERITY.info,
  SEVERITY.passed,
];

const SEVERITY_DISPLAY: Record<
  string,
  { skin: string; icon: string; label: string }
> = {
  [SEVERITY.violation]: { skin: 'error', icon: 'cross', label: 'Fout' },
  [SEVERITY.warning]: {
    skin: 'warning',
    icon: 'alert-triangle',
    label: 'Waarschuwing',
  },
  [SEVERITY.info]: { skin: 'default', icon: 'info-circle', label: 'Info' },
  [SEVERITY.passed]: { skin: 'success', icon: 'check', label: 'In orde' },
};

export type EvaluationCheck = {
  name: string;
  label: string;
  conforms: boolean;
  display: { skin: string; icon: string; label: string };
  messages: string[];
};

export type EvaluationRow = {
  // The document the checks are about, or null for the checks of the session.
  value: string | null;
  checks: EvaluationCheck[];
};

function worstSeverity(results: ValidationResultModel[]): string {
  const severities = results.map((r) => r.severity ?? SEVERITY.violation);
  return (
    SEVERITY_ORDER.find((severity) => severities.includes(severity)) ??
    SEVERITY.violation
  );
}

async function toRows(
  reports: ValidationReportModel[],
): Promise<EvaluationRow[]> {
  const rows = new Map<string | null, Map<string, ValidationResultModel[]>>();
  for (const report of reports) {
    const results = (await report.results).slice();
    for (const result of results) {
      const shape = await result.sourceShape;
      const name = shape?.name ?? 'other';
      const value = result.value ?? null;
      const checks =
        rows.get(value) ?? new Map<string, ValidationResultModel[]>();
      checks.set(name, [...(checks.get(name) ?? []), result]);
      rows.set(value, checks);
    }
  }

  const order = Object.keys(CHECK_LABELS);
  return [...rows.entries()]
    .map(([value, checks]) => ({
      value,
      checks: [...checks.entries()]
        .map(([name, results]) => {
          const conforms = results.every((r) => r.passed);
          const severity = conforms ? SEVERITY.passed : worstSeverity(results);
          const shown = conforms ? results : results.filter((r) => !r.passed);
          return {
            name,
            label: CHECK_LABELS[name] ?? name,
            conforms,
            display:
              SEVERITY_DISPLAY[severity] ??
              SEVERITY_DISPLAY[SEVERITY.violation],
            messages: [
              ...new Set(shown.map((r) => r.messageText).filter(Boolean)),
            ],
          } as EvaluationCheck;
        })
        .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name)),
    }))
    .sort((a, b) =>
      a.value === null
        ? -1
        : b.value === null
          ? 1
          : a.value.localeCompare(b.value),
    );
}

export default class SessionEvaluation extends Component<Signature> {
  @service declare store: Store;

  constructor(owner: unknown, args: Signature['Args']) {
    super(owner, args);
    this.loadTask.perform();
  }

  loadTask = task(async () => {
    const reports = await this.store.query('validation-report', {
      filter: { session: { ':id:': this.args.session.id } },
      include: 'results.source-shape',
      page: { size: 10 },
    });
    const list = reports.slice();
    return {
      reports: list,
      conforms: list.every((r) => r.conforms),
      rows: await toRows(list),
    };
  });

  get evaluation() {
    return this.loadTask.last?.value;
  }
}
