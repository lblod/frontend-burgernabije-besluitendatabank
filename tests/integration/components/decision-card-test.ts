import { module, test } from "qunit";
import { setupRenderingTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";

module("Integration | Component | decision-card", (hooks) => {
  setupRenderingTest({ hooks: hooks });

  test("it renders", async (assert: any) => {
    await render(hbs`<DecisionCard />`);

    assert.dom("").hasText("");
    await render(hbs`
      <DecisionCard>
        template block text
      </DecisionCard>
    `);

    assert.dom("").hasText("template block text");
  });
});
