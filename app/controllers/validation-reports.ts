import Controller from '@ember/controller';

import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import type { LocalGovernmentOption } from 'frontend-burgernabije-besluitendatabank/services/government-list';

export type GoverningBodyOption = {
  id: string;
  label: string;
  type: string;
};

export default class ValidationReportsController extends Controller {
  @service declare currentSession: CurrentSessionService;
  @service declare governmentList: GovernmentListService;

  @tracked governingBodyOptions: GoverningBodyOption[] = [];
  @tracked selectedGovernments: LocalGovernmentOption[] = [];
  @tracked selectedGoverningBodies: GoverningBodyOption[] = [];

  @action
  updateSelectedGovernments(newOptions: LocalGovernmentOption[]) {
    this.selectedGovernments = newOptions;
  }

  @action
  updateSelectedGoverningBodies(newOptions: GoverningBodyOption[]) {
    this.selectedGoverningBodies = newOptions;
  }
}
