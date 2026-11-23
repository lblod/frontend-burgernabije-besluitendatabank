import Controller from '@ember/controller';
import { service } from '@ember/service';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';

export default class ValidationReportsController extends Controller {
  @service declare currentSession: CurrentSessionService;
}
