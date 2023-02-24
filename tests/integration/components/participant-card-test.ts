import { module, test } from "qunit";
import { setupRenderingTest } from "frontend-burgernabije-besluitendatabank/tests/helpers";
import { render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";

module("Integration | Component | participant-card", (hooks: any) => {
  setupRenderingTest(hooks);

  test("it renders", async (assert: any) => {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<ParticipantCard />`);

    // Template block usage:
    await render(hbs`
      <ParticipantCard>
        template block text
      </ParticipantCard>
    `);

    assert.dom().hasText("template block text");
  });
});
