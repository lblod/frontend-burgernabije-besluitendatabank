import { module, test } from 'qunit';
import { setupTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';

module('Unit | Controller | municipality', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:municipality');
    assert.ok(controller);
  });
});
