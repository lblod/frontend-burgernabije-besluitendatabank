import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';

export const DEFAULT_MAINTENANCE_MESSAGE =
  'We voeren momenteel onderhoudswerken uit. Hierdoor kan Lokaal Beslist tijdelijk minder goed of onvolledig werken. Onze excuses voor het ongemak.';

const isPlaceholder = (value?: string) => !value || value.startsWith('{{');

export default class MaintenanceBanner extends Component {
  @tracked isDismissed = false;

  get isEnabled() {
    const enabled = config.maintenance?.enabled;
    return !isPlaceholder(enabled) && enabled.trim().toLowerCase() === 'true';
  }

  get message() {
    const message = config.maintenance?.message;
    return isPlaceholder(message) || !message.trim()
      ? DEFAULT_MAINTENANCE_MESSAGE
      : message;
  }

  @action
  dismiss() {
    this.isDismissed = true;
  }
}
