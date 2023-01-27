import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | search-sidebar', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<SearchSidebar />`);

    assert.dom(this.element).hasText('');

    // Template block usage:
    await render(hbs`
      <SearchSidebar>
        template block text
      </SearchSidebar>
    `);

    assert.dom(this.element).hasText('template block text');
  });
});
