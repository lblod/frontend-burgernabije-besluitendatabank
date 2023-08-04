import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import {
  endOfMonth,
  endOfWeek as endOfWeekDateFns,
  endOfYear,
  formatISO,
  startOfMonth,
  startOfWeek as startOfWeekDateFns,
  startOfYear,
  sub,
} from 'date-fns';

type ISODateString = string;

interface Signature {
  Args: {
    label: string;
    startQueryParam: string;
    endQueryParam: string;
    start?: ISODateString;
    end?: ISODateString;
  };
}

enum Preset {
  ThisWeek = 'Deze week',
  LastWeek = 'Vorige week',
  ThisMonth = 'Deze maand',
  LastMonth = 'Vorige maand',
  ThisYear = 'Dit jaar',
  LastYear = 'Vorig jaar',
}

export default class DateRangeFilterComponent extends Component<Signature> {
  @service declare router: RouterService;
  @tracked start: string | null;
  @tracked end: string | null;
  @tracked selectedPreset: Preset | null = null;
  @tracked isChoosingPresets = true;

  presets = [
    Preset.ThisWeek,
    Preset.LastWeek,
    Preset.ThisMonth,
    Preset.LastMonth,
    Preset.ThisYear,
    Preset.LastYear,
  ];

  @cached
  get presetDateRanges() {
    const today = new Date();
    return {
      [Preset.ThisWeek]: [
        toIsoDateString(startOfWeek(today)),
        toIsoDateString(endOfWeek(today)),
      ],
      [Preset.LastWeek]: [
        toIsoDateString(startOfWeek(sub(today, { weeks: 1 }))),
        toIsoDateString(endOfWeek(sub(today, { weeks: 1 }))),
      ],
      [Preset.ThisMonth]: [
        toIsoDateString(startOfMonth(today)),
        toIsoDateString(endOfMonth(today)),
      ],
      [Preset.LastMonth]: [
        toIsoDateString(startOfMonth(sub(today, { months: 1 }))),
        toIsoDateString(endOfMonth(sub(today, { months: 1 }))),
      ],
      [Preset.ThisYear]: [
        toIsoDateString(startOfYear(today)),
        toIsoDateString(endOfYear(today)),
      ],
      [Preset.LastYear]: [
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
      }
    } else {
      this.resetQueryParams();
    }
  }

  @action handleStartDateChange(newDate: string | null): void {
    this.start = newDate;

    if (this.isInvalidDateRange) {
      this.end = null;
    }

    this.updateQueryParamsIfValid();
  }

  @action handleEndDateChange(newDate: string | null): void {
    this.end = newDate;

    if (this.isInvalidDateRange) {
      this.start = null;
    }

    this.updateQueryParamsIfValid();
  }

  @action chooseCustomRange() {
    this.isChoosingPresets = false;
    this.selectedPreset = null;
  }

  @action choosePresets() {
    this.isChoosingPresets = true;

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
    if (maybePreset) {
      this.selectedPreset = maybePreset;
    } else {
      // The dates don't match a preset, so we switch to the custom date inputs instead
      this.isChoosingPresets = false;
    }
  }

  findPreset(
    start: ISODateString | null,
    end: ISODateString | null
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

  updateQueryParamsIfValid() {
    if (this.hasBothDates || this.hasNoDates) {
      this.updateQueryParams();
    }
  }

  resetQueryParams(): void {
    this.start = null;
    this.end = null;
    this.updateQueryParams();
  }

  updateQueryParams(): void {
    this.router.transitionTo({
      queryParams: {
        [this.args.startQueryParam]: this.start,
        [this.args.endQueryParam]: this.end,
      },
    });
  }
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
