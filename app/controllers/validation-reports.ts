import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import {
  PAGE_SIZE,
  type ValidationReportsModel,
} from 'frontend-burgernabije-besluitendatabank/routes/validation-reports';

export default class ValidationReportsController extends Controller {
  @service declare currentSession: CurrentSessionService;

  queryParams = ['page'];
  @tracked page = 0;

  declare model: ValidationReportsModel;

  // As in the design: "1 - 10 van 100".
  get rangeLabel(): string {
    const { page, total, rows } = this.model;
    const from = page * PAGE_SIZE + 1;
    const to = page * PAGE_SIZE + rows.length;
    return `${from} - ${to} van ${total}`;
  }

  get hasPreviousPage(): boolean {
    return this.model.page > 0;
  }

  get hasNextPage(): boolean {
    return (this.model.page + 1) * PAGE_SIZE < this.model.total;
  }

  @action
  previousPage() {
    this.page = Math.max(0, this.model.page - 1);
  }

  @action
  nextPage() {
    this.page = this.model.page + 1;
  }
}
