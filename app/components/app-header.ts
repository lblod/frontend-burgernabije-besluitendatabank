import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';

export default class AppHeader extends Component {
  @service declare currentSession: CurrentSessionService;

  @action
  login() {
    this.currentSession.login();
  }

  @action
  async logout() {
    await this.currentSession.logout();
  }
}
