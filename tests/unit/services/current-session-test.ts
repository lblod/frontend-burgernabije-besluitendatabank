import { module, test } from "qunit";
import { setupTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";

module("Unit | Service | currentSession", (hooks: any) => {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test("it exists", function (assert) {
    let service = this.owner.lookup("service:current-session");
    assert.ok(service);
  });
});
