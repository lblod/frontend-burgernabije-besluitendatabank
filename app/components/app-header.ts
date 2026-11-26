import Component from '@glimmer/component';
import { service } from '@ember/service';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import { isAcmidmConfigured } from 'frontend-burgernabije-besluitendatabank/utils/acmidm';

export default class AppHeader extends Component {
  @service declare currentSession: CurrentSessionService;

  readonly isMockLogin = config.login.mock;
  readonly canLogIn = config.login.mock || isAcmidmConfigured();

  get userLabel(): string {
    const { userLabel, isAbb, isSupplier, isBestuur } = this.currentSession;
    if (userLabel) return userLabel;
    if (isAbb) return 'ABB';
    if (isSupplier) return 'Leverancier';
    if (isBestuur) return 'Bestuur';
    return 'Aangemeld';
  }
}
