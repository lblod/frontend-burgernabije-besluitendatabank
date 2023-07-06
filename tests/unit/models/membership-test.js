import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | membership', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('membership', {});
    assert.ok(model);
  });
});
