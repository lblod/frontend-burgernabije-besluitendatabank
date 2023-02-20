import { module, test } from "qunit";
import { setupRenderingTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";

module("Integration | Component | hero", (hooks) => {
  setupRenderingTest({ hooks: hooks });

  test("it renders", async (assert: any) => {
    await render(hbs`<Hero />`);

    assert.dom("").hasText("");
    await render(hbs`
      <Hero>
        template block text
      </Hero>
    `);

    assert.dom("").hasText("template block text");
  });
});
