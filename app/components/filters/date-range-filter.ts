import { action } from '@ember/object';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import { cached, tracked } from '@glimmer/tracking';
import {
  endOfMonth,
  endOfQuarter,
  endOfWeek as endOfWeekDateFns,
  endOfYear,
  formatISO,
  getQuarter,
  parseISO,
  startOfMonth,
  startOfQuarter,
  startOfWeek as startOfWeekDateFns,
  startOfYear,
  sub,
} from 'date-fns';
type ISODateString = string;

interface Signature {
  Args: {
    startQueryParam: string;
    endQueryParam: string;
    start?: ISODateString;
    end?: ISODateString;
    updateSelected: (start: string | null, end: string | null) => void;
  };
}

enum FixedPreset {
  Future = 'Toekomst',
  ThisWeek = 'Deze week',
  LastWeek = 'Vorige week',
  ThisMonth = 'Deze maand',
  LastMonth = 'Vorige maand',
  ThisYear = 'Dit jaar',
  LastYear = 'Vorig jaar',
}

type Preset = string;
type DateRange = [ISODateString, ISODateString];

enum Mode {
  Presets = 'presets',
  Quarters = 'quarters',
  Custom = 'custom',
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;
type Quarter = (typeof QUARTERS)[number];

export default class DateRangeFilterComponent extends Component<Signature> {
  readonly MIN = '2015-01-01';
  readonly MAX = '2100-12-31';
  readonly MIN_DATE = new Date(this.MIN);
  readonly MAX_DATE = new Date(this.MAX);

  @service declare router: RouterService;
  @tracked start: string | null;
  @tracked end: string | null;
  @tracked selectedPreset: Preset | null = null;
  @tracked mode: Mode = Mode.Presets;
  @tracked selectedQuarter: Quarter | null = null;
  @tracked selectedYear: number | null = null;
  @tracked endDateError?: string[];
  @tracked startDateError?: string[];

  readonly quarters = QUARTERS;

  get isChoosingPresets(): boolean {
    return this.mode === Mode.Presets;
  }

  get isChoosingQuarters(): boolean {
    return this.mode === Mode.Quarters;
  }

  // Most recent year first, down to the first year with data.
  get years(): number[] {
    const first = this.MIN_DATE.getFullYear();
    const current = new Date().getFullYear();
    return Array.from({ length: current - first + 1 }, (_, i) => current - i);
  }

  // The order of the keys in presetDateRanges is the order shown in the select.
  get presets(): Preset[] {
    return Object.keys(this.presetDateRanges);
  }

  @cached
  get presetDateRanges(): Record<Preset, DateRange> {
    const today = new Date();
    return {
      [FixedPreset.Future]: [toIsoDateString(today), this.MAX],
      [FixedPreset.ThisWeek]: [
        toIsoDateString(startOfWeek(today)),
        toIsoDateString(endOfWeek(today)),
      ],
      [FixedPreset.LastWeek]: [
        toIsoDateString(startOfWeek(sub(today, { weeks: 1 }))),
        toIsoDateString(endOfWeek(sub(today, { weeks: 1 }))),
      ],
      [FixedPreset.ThisMonth]: [
        toIsoDateString(startOfMonth(today)),
        toIsoDateString(endOfMonth(today)),
      ],
      [FixedPreset.LastMonth]: [
        toIsoDateString(startOfMonth(sub(today, { months: 1 }))),
        toIsoDateString(endOfMonth(sub(today, { months: 1 }))),
      ],
      [FixedPreset.ThisYear]: [
        toIsoDateString(startOfYear(today)),
        toIsoDateString(endOfYear(today)),
      ],
      [FixedPreset.LastYear]: [
        toIsoDateString(startOfYear(sub(today, { years: 1 }))),
        toIsoDateString(endOfYear(sub(today, { years: 1 }))),
      ],
    };
  }

  get hasBothDates(): boolean {
    return Boolean(this.start) && Boolean(this.end);
  }

  get hasNoDates(): boolean {
    return !this.start && !this.end;
  }

  get isInvalidDateRange(): boolean {
    return (
      !!this.start && !!this.end && new Date(this.start) > new Date(this.end)
    );
  }

  constructor(owner: unknown, args: Signature['Args']) {
    super(owner, args);

    const { start, end } = this.args;
    this.start = start ? start : null;
    this.end = end ? end : null;
    this.setInitialPreset();
  }

  @action handleSelectionChange(selectedPreset: Preset | null): void {
    this.selectedPreset = selectedPreset;

    if (selectedPreset) {
      const presetDates = this.presetDateRanges[selectedPreset];

      if (presetDates) {
        const [presetStart = null, presetEnd = null] = presetDates;
        this.start = presetStart;
        this.end = presetEnd;
        this.updateQueryParams();
        this.args.updateSelected(presetStart, presetEnd);
      }
    } else {
      this.resetQueryParams();
    }
  }

  @action handleStartDateChange(newDate: string | null): void {
    this.start = newDate;

    if (this.isDateComplete(newDate)) {
      this.updateQueryParamsIfValid();
    }
  }

  @action handleEndDateChange(newDate: string | null): void {
    this.end = newDate;

    if (this.isDateComplete(newDate)) {
      this.updateQueryParamsIfValid();
    }
  }

  isDateComplete(date: string | null): boolean {
    return date === null || date.length === 10;
  }

  @action handleQuarterChange(quarter: Quarter | null): void {
    this.selectedQuarter = quarter;
    if (quarter && !this.selectedYear) {
      this.selectedYear = new Date().getFullYear();
    }
    this.applySelectedQuarter();
  }

  @action handleYearChange(year: number | null): void {
    this.selectedYear = year;
    if (year && !this.selectedQuarter) {
      this.selectedQuarter = currentQuarter();
    }
    this.applySelectedQuarter();
  }

  applySelectedQuarter(): void {
    const { selectedQuarter, selectedYear } = this;

    if (selectedQuarter && selectedYear) {
      const [start, end] = quarterDateRange(selectedQuarter, selectedYear);
      this.start = start;
      this.end = end;
      this.updateQueryParams();
      this.args.updateSelected(start, end);
    } else if (!this.hasNoDates) {
      // An incomplete quarter selection doesn't filter anything.
      this.resetQueryParams();
    }
  }

  @action chooseCustomRange() {
    this.mode = Mode.Custom;
    this.selectedPreset = null;
    this.selectedQuarter = null;
    this.selectedYear = null;
  }

  @action chooseQuarters() {
    this.mode = Mode.Quarters;
    this.selectedPreset = null;
    this.selectedQuarter = null;
    this.selectedYear = null;

    const maybeQuarter = this.findQuarter(this.start, this.end);
    if (maybeQuarter) {
      [this.selectedQuarter, this.selectedYear] = maybeQuarter;
    } else {
      // Prefill with the current quarter. This also replaces any dates that don't match a quarter, so there is
      // never a hidden date filter applied in the background.
      this.selectedQuarter = currentQuarter();
      this.selectedYear = new Date().getFullYear();
      this.applySelectedQuarter();
    }
  }

  @action choosePresets() {
    this.mode = Mode.Presets;
    this.selectedQuarter = null;
    this.selectedYear = null;

    if (this.hasNoDates) {
      return;
    }

    const maybePreset = this.findPreset(this.start, this.end);
    if (maybePreset) {
      this.selectedPreset = maybePreset;
    } else {
      // If the dates don't match a preset we clear the dates. Otherwise the UI would show an empty select while
      // there is still a date filter applied in the background.
      this.resetQueryParams();
    }
  }

  setInitialPreset(): void {
    if (this.hasNoDates) {
      return;
    }

    const maybePreset = this.findPreset(this.start, this.end);
    const maybeQuarter = this.findQuarter(this.start, this.end);
    if (maybePreset) {
      this.selectedPreset = maybePreset;
    } else if (maybeQuarter) {
      this.mode = Mode.Quarters;
      [this.selectedQuarter, this.selectedYear] = maybeQuarter;
    } else {
      // The dates don't match a preset or quarter, so we switch to the custom date inputs instead
      this.mode = Mode.Custom;
    }
  }

  findQuarter(
    start: ISODateString | null,
    end: ISODateString | null,
  ): [Quarter, number] | null {
    if (!start || !end) {
      return null;
    }

    const startDate = parseISO(start);
    const year = startDate.getFullYear();
    const quarter = QUARTERS[getQuarter(startDate) - 1];
    if (!quarter || !this.years.includes(year)) {
      return null;
    }

    const [quarterStart, quarterEnd] = quarterDateRange(quarter, year);
    return start === quarterStart && end === quarterEnd
      ? [quarter, year]
      : null;
  }

  findPreset(
    start: ISODateString | null,
    end: ISODateString | null,
  ): Preset | null {
    const NO_PRESET = null;

    const couldMatchPreset = start && end;
    if (couldMatchPreset) {
      const maybePreset = this.presets.find((preset) => {
        const presetDates = this.presetDateRanges[preset];

        if (presetDates) {
          const [presetStart, presetEnd] = presetDates;
          return start === presetStart && end === presetEnd;
        }
      });

      return maybePreset ? maybePreset : NO_PRESET;
    } else {
      return NO_PRESET;
    }
  }

  updateQueryParamsIfValid(): void {
    const startDate = this.start ? new Date(this.start) : new Date();
    const endDate = this.end ? new Date(this.end) : new Date();
    this.startDateError = [];
    this.endDateError = [];
    let isBlocked = false;

    if (startDate > this.MAX_DATE || startDate < this.MIN_DATE) {
      this.startDateError.push(
        'De startdatum moet tussen 1 januari 2015 en 31 december 2100 liggen',
      );
    }
    if (endDate > this.MAX_DATE || endDate < this.MIN_DATE) {
      this.endDateError.push(
        'De einddatum moet tussen 1 januari 2015 en 31 december 2100 liggen',
      );
    }
    if (this.isInvalidDateRange) {
      this.endDateError.push('De startdatum moet voor de einddatum liggen');
      isBlocked = true;
    }
    if (!isBlocked) this.updateQueryParams();
  }

  resetQueryParams(): void {
    this.start = null;
    this.end = null;
    this.updateQueryParams();
    this.args.updateSelected(null, null);
  }

  updateQueryParams(): void {
    this.router.transitionTo({
      queryParams: {
        [this.args.startQueryParam || 'start']: !this.startDateError?.length
          ? this.start
          : null,
        [this.args.endQueryParam || 'end']: !this.endDateError?.length
          ? this.end
          : null,
      },
    });
  }
}

function currentQuarter(): Quarter {
  return QUARTERS[getQuarter(new Date()) - 1] as Quarter;
}

function quarterDateRange(quarter: Quarter, year: number): DateRange {
  const start = startOfQuarter(
    new Date(year, QUARTERS.indexOf(quarter) * 3, 1),
  );
  return [toIsoDateString(start), toIsoDateString(endOfQuarter(start))];
}

function toIsoDateString(date: Date): ISODateString {
  return formatISO(date, { representation: 'date' });
}

function startOfWeek(date: Date) {
  return startOfWeekDateFns(date, { weekStartsOn: 1 });
}

function endOfWeek(date: Date) {
  return endOfWeekDateFns(date, { weekStartsOn: 1 });
}
