import { module, test } from "qunit";
import { setupTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";

module("Unit | Service | session", (hooks: any) => {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test("it exists", function (assert) {
    let service = this.owner.lookup("service:session");
    assert.ok(service);
  });
});
