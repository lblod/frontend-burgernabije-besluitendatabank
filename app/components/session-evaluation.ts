import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import type Store from '@ember-data/store';
import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';
import type ReportModel from 'frontend-burgernabije-besluitendatabank/models/report';
import type ValidationresultModel from 'frontend-burgernabije-besluitendatabank/models/validationresult';
import {
  CHECK_LABELS,
  SEVERITY,
  SEVERITY_DISPLAY,
  SEVERITY_ORDER,
  type SeverityDisplay,
} from 'frontend-burgernabije-besluitendatabank/constants/validation';

interface Signature {
  Args: { session: SessionModel };
}

export type EvaluationCheck = {
  name: string;
  label: string;
  conforms: boolean;
  display: SeverityDisplay;
  messages: string[];
};

export type EvaluationRow = {
  // The document the checks are about, or null for the checks of the session.
  value: string | null;
  checks: EvaluationCheck[];
};

function worstSeverity(results: ValidationresultModel[]): string {
  const severities = results.map((r) => r.resultSeverity ?? SEVERITY.violation);
  return (
    SEVERITY_ORDER.find((severity) => severities.includes(severity)) ??
    SEVERITY.violation
  );
}

async function toRows(report: ReportModel): Promise<EvaluationRow[]> {
  const rows = new Map<string | null, Map<string, ValidationresultModel[]>>();
  for (const result of (await report.validationresults).slice()) {
    const shape = await result.sourceShape;
    const name = shape?.name ?? 'other';
    const value = result.value ?? null;
    const checks =
      rows.get(value) ?? new Map<string, ValidationresultModel[]>();
    checks.set(name, [...(checks.get(name) ?? []), result]);
    rows.set(value, checks);
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

  // Every validation run makes a new report: only the latest one is shown. A
  // report has no relation to the session: its results have it as focus node.
  loadTask = task(async () => {
    const { uri } = this.args.session;
    if (!uri) return null;
    const reports = await this.store.query('report', {
      filter: { validationresults: { ':exact:focus-node': uri } },
      include: 'validationresults.source-shape',
      sort: '-created',
      page: { size: 1 },
    });
    const [report] = reports.slice();
    if (!report) return null;
    return {
      report,
      conforms: Boolean(report.conforms),
      rows: await toRows(report),
    };
  });

  get evaluation() {
    return this.loadTask.last?.value;
  }
}
