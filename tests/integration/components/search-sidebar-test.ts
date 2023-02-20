import { module, test } from "qunit";
import { setupRenderingTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";

module("Integration | Component | search-sidebar", (hooks) => {
  setupRenderingTest({ hooks: hooks });

  test("it renders", async (assert: any) => {
    await render(hbs`<SearchSidebar />`);

    assert.dom("").hasText("");
    await render(hbs`
      <SearchSidebar>
        template block text
      </SearchSidebar>
    `);

    assert.dom("").hasText("template block text");
  });
});
