import { module, test } from "qunit";
import { setupRenderingTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";

module("Integration | Helper | isoFormatter", (hooks: any) => {
  setupRenderingTest(hooks);

  // TODO: Replace this with your real tests.
  test("it renders", async (assert: any) => {
    await render(hbs`{{iso-formatter "1234"}}`);

    assert.dom("").hasText("1234");
  });
});
