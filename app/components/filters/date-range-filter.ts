import ToasterService from '@appuniversum/ember-appuniversum/addon/services/toaster';
import { A } from '@ember/array';
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @service declare toaster: ToasterService;
  @tracked start: string | null;
  @tracked end: string | null;
  @tracked min = '2015-01-01';
  @tracked max = '2100-12-31';
  @tracked selectedPreset: Preset | null = null;
  @tracked isChoosingPresets = true;
  @tracked errorMessages = A<string>([]);
  @tracked clearableToast: unknown | null = null;

  @action
  triggerClearableToast() {
    this.errorMessages.forEach((errorMessage, index) => {
      if (index !== 0) {
        this.errorMessages[index] = errorMessage.toLowerCase();
      }
    });
    this.clearableToast = this.toaster.error(
      this.errorMessages.toArray().join(' & '),
      'Er is een probleem'
    );
  }

  @action
  triggerClearToast() {
    if (this.clearableToast) {
      this.toaster.close(this.clearableToast);
    }
  }

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

    if (this.isDateComplete(newDate)) {
      // if the start is before 2015 don't update the query params

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
    return date !== null && date.length === 10;
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

  updateQueryParamsIfValid(): void {
    const startDate = this.start ? new Date(this.start) : new Date();
    const endDate = this.end ? new Date(this.end) : new Date();
    const minDate = new Date(this.min);
    const maxDate = new Date(this.max);
    this.triggerClearToast();
    this.errorMessages.clear(); // Clear existing error messages

    if (
      startDate < minDate ||
      endDate < minDate ||
      startDate > maxDate ||
      endDate > maxDate ||
      this.isInvalidDateRange
    ) {
      if (
        startDate < minDate ||
        endDate < minDate ||
        startDate > maxDate ||
        endDate > maxDate
      ) {
        this.pushUniqueErrorMessage('De datum moet tussen 2015 en 2100 liggen');
      }
      if (this.isInvalidDateRange) {
        this.pushUniqueErrorMessage(
          'De einddatum moet na de startdatum liggen'
        );
      }
      this.triggerClearableToast();
    } else {
      // clear toasters
      this.triggerClearToast();
      this.errorMessages.clear(); // Clear existing error messages when dates are valid
      this.updateQueryParams();
    }
  }
  pushUniqueErrorMessage(errorMessage: string) {
    // Check if the error message is not already in the array before pushing
    if (!this.errorMessages.includes(errorMessage)) {
      this.errorMessages.push(errorMessage);
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
