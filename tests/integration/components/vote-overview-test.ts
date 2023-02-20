import { module, test } from "qunit";
import { setupRenderingTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";

module("Integration | Component | vote-overview", (hooks) => {
  setupRenderingTest({ hooks: hooks });

  test("it renders", async (assert: any) => {
    await render(hbs`<VoteOverview />`);

    assert.dom("").hasText("");
    await render(hbs`
      <VoteOverview>
        template block text
      </VoteOverview>
    `);

    assert.dom("").hasText("template block text");
  });
});
