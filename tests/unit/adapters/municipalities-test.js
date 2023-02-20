import { module, test } from 'qunit';

import { setupTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';

module('Unit | Adapter | municipalities', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let adapter = this.owner.lookup('adapter:municipalities');
    assert.ok(adapter);
  });
});
