import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';
import { DEFAULT_MAINTENANCE_MESSAGE } from 'frontend-burgernabije-besluitendatabank/components/maintenance-banner';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Component | maintenance-banner', function (hooks) {
  setupRenderingTest(hooks);

  let originalMaintenance;

  hooks.beforeEach(function () {
    originalMaintenance = config.maintenance;
  });

  hooks.afterEach(function () {
    config.maintenance = originalMaintenance;
  });

  test('it is hidden when the env variable is not set', async function (assert) {
    config.maintenance = {
      enabled: '{{MAINTENANCE_BANNER_ENABLED}}',
      message: '{{MAINTENANCE_BANNER_MESSAGE}}',
    };
    await render(hbs`<MaintenanceBanner />`);
    assert.dom('[data-test-maintenance-banner]').doesNotExist();
  });

  test('it is hidden when enabled is not "true"', async function (assert) {
    config.maintenance = { enabled: 'false', message: '' };
    await render(hbs`<MaintenanceBanner />`);
    assert.dom('[data-test-maintenance-banner]').doesNotExist();
  });

  test('it shows the default message when enabled without custom text', async function (assert) {
    config.maintenance = {
      enabled: 'true',
      message: '{{MAINTENANCE_BANNER_MESSAGE}}',
    };
    await render(hbs`<MaintenanceBanner />`);
    assert
      .dom('[data-test-maintenance-banner]')
      .includesText(DEFAULT_MAINTENANCE_MESSAGE);
  });

  test('it shows a custom message and can be dismissed', async function (assert) {
    config.maintenance = { enabled: 'TRUE', message: 'Gepland onderhoud' };
    await render(hbs`<MaintenanceBanner />`);
    assert
      .dom('[data-test-maintenance-banner]')
      .includesText('Gepland onderhoud');

    await click('[data-test-maintenance-banner] button');
    assert.dom('[data-test-maintenance-banner]').doesNotExist();
  });
});
