import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-burgernabije-besluitendatabank/tests/helpers';
import { click, fillIn, find, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { selectChoose } from 'ember-power-select/test-support';
module('Integration | Component | filters/date-range-filter', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    await render(hbs`<Filters::DateRangeFilter />`);
  });

  test('it displays presets by default', async function (assert) {
    assert
      .dom(this.element)
      .hasText('Periodes Alle periodes Kwartalen Eigen periode');
  });

  test('it switches between presets, quarters and custom date range', async function (assert) {
    await click('[data-test-toggle-quarters]');
    assert.dom('#date-quarter').exists();
    assert.dom('#date-year').exists();
    assert.dom('#date-period').doesNotExist();

    await click('[data-test-toggle-custom]');
    assert.dom('[data-test-date-range-filter-from]').exists();
    assert.dom('#date-quarter').doesNotExist();

    await click('[data-test-toggle-presets]');
    assert.dom('#date-period').exists();
    assert.dom('[data-test-date-range-filter-from]').doesNotExist();
  });

  module('quarters', function () {
    const year = new Date().getFullYear();
    const quarters = [
      ['Q1', `${year}-01-01`, `${year}-03-31`],
      ['Q2', `${year}-04-01`, `${year}-06-30`],
      ['Q3', `${year}-07-01`, `${year}-09-30`],
      ['Q4', `${year}-10-01`, `${year}-12-31`],
    ];

    quarters.forEach(([quarter, start, end]) => {
      test(`it recognises ${start} to ${end} as ${quarter} ${year}`, async function (assert) {
        this.start = start;
        this.end = end;

        await render(
          hbs`<Filters::DateRangeFilter @start={{this.start}} @end={{this.end}} />`,
        );

        assert.dom('#date-quarter').includesText(quarter);
        assert.dom('#date-year').includesText(`${year}`);
      });
    });

    test('it recognises a quarter of a previous year', async function (assert) {
      this.start = '2020-04-01';
      this.end = '2020-06-30';

      await render(
        hbs`<Filters::DateRangeFilter @start={{this.start}} @end={{this.end}} />`,
      );

      assert.dom('#date-quarter').includesText('Q2');
      assert.dom('#date-year').includesText('2020');
    });

    test('it applies the selected quarter, defaulting to the current year', async function (assert) {
      const router = this.owner.lookup('service:router');
      router.transitionTo = sinon.stub();
      this.updateSelected = sinon.stub();

      await render(
        hbs`<Filters::DateRangeFilter @updateSelected={{this.updateSelected}} />`,
      );
      await click('[data-test-toggle-quarters]');
      await selectChoose('#date-quarter', 'Q3');

      assert.dom('#date-year').includesText(`${year}`);
      assert.deepEqual(router.transitionTo.lastCall.args[0], {
        queryParams: { start: `${year}-07-01`, end: `${year}-09-30` },
      });
      assert.true(
        this.updateSelected.calledWith(`${year}-07-01`, `${year}-09-30`),
      );

      await selectChoose('#date-year', '2019');
      assert.deepEqual(router.transitionTo.lastCall.args[0], {
        queryParams: { start: '2019-07-01', end: '2019-09-30' },
      });
    });
  });

  module('when custom date range is selected', function (hooks) {
    hooks.beforeEach(async function () {
      await click('[data-test-toggle-custom]');
      this.router = this.owner.lookup('service:router');
      this.router.transitionTo = sinon.stub();
    });

    const dateRangeFilterFromSelector = async () =>
      await find('[data-test-date-range-filter-from]');

    const dateRangeFilterToSelector = async () =>
      await find('[data-test-date-range-filter-to]');

    test('it updates queryParams when date valide ', async function (assert) {
      assert.expect(2);

      await fillIn(await dateRangeFilterFromSelector(), '2023-01-01');

      assert.true(this.router.transitionTo.calledOnce);
      assert.deepEqual(this.router.transitionTo.getCall(0).args, [
        {
          queryParams: {
            end: null,
            start: '2023-01-01',
          },
        },
      ]);
    });

    test('it updates queryParams when date is cleared', async function (assert) {
      assert.expect(3);

      await fillIn(await dateRangeFilterFromSelector(), '2023-01-01');
      await fillIn(await dateRangeFilterFromSelector(), '');

      assert.true(this.router.transitionTo.calledTwice);
      assert.deepEqual(this.router.transitionTo.getCall(0).args[0], {
        queryParams: {
          end: null,
          start: '2023-01-01',
        },
      });
      assert.deepEqual(this.router.transitionTo.getCall(1).args[0], {
        queryParams: {
          end: null,
          start: null,
        },
      });
    });

    test('it displays error when from date is before 2015', async function (assert) {
      assert.expect(2);

      await fillIn(await dateRangeFilterFromSelector(), '2014-12-31');
      await fillIn(await dateRangeFilterToSelector(), '2014-12-31');

      assert
        .dom(
          '[data-test-date-range-filter-from-error="De startdatum moet tussen 1 januari 2015 en 31 december 2100 liggen"]',
        )
        .exists();

      assert
        .dom(
          '[data-test-date-range-filter-to-error="De einddatum moet tussen 1 januari 2015 en 31 december 2100 liggen"]',
        )
        .exists();
    });

    test('it displays error when to date is after 2100', async function (assert) {
      assert.expect(2);

      await fillIn(await dateRangeFilterFromSelector(), '2101-01-01');
      await fillIn(await dateRangeFilterToSelector(), '2101-01-01');

      assert
        .dom(
          '[data-test-date-range-filter-from-error="De startdatum moet tussen 1 januari 2015 en 31 december 2100 liggen"]',
        )
        .exists();

      assert
        .dom(
          '[data-test-date-range-filter-to-error="De einddatum moet tussen 1 januari 2015 en 31 december 2100 liggen"]',
        )
        .exists();
    });

    test('it displays error when from date is after to date', async function (assert) {
      assert.expect(3);

      await fillIn(await dateRangeFilterFromSelector(), '2023-12-31');
      await fillIn(await dateRangeFilterToSelector(), '2023-01-01');

      assert
        .dom(
          '[data-test-date-range-filter-to-error="De startdatum moet voor de einddatum liggen"]',
        )
        .exists();

      assert.true(this.router.transitionTo.calledOnce);
      assert.deepEqual(this.router.transitionTo.getCall(0).args, [
        {
          queryParams: {
            end: null,
            start: '2023-12-31',
          },
        },
      ]);
    });
  });
});
