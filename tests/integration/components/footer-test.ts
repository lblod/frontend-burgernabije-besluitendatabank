import { module, test } from "qunit";
import { setupRenderingTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";

module("Integration | Component | footer", (hooks) => {
  setupRenderingTest({ hooks: hooks });

  test("it renders", async (assert: any) => {
    await render(hbs`<Footer />`);

    assert.dom("").hasText("");
    await render(hbs`
      <Footer>
        template block text
      </Footer>
    `);

    assert.dom("").hasText("template block text");
  });
});
