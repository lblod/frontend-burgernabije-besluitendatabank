import { module, test } from "qunit";
import { setupRenderingTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";

module("Integration | Component | navbar", (hooks) => {
  setupRenderingTest({ hooks: hooks });

  test("it renders", async (assert: any) => {
    await render(hbs`<Navbar />`);

    assert.dom("").hasText("");
    await render(hbs`
      <Navbar>
        template block text
      </Navbar>
    `);

    assert.dom("").hasText("template block text");
  });
});
