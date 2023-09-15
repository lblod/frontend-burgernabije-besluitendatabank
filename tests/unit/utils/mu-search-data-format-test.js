import { module, test } from 'qunit';
import { parseDateStringToDate } from 'frontend-burgernabije-besluitendatabank/utils/mu-search-data-format';

module('Unit | Utility | mu-search-data-format', function () {
  module('parseDateStringToDate', function () {
    test('it returns Date when no input', function (assert) {
      assert.deepEqual(
        parseDateStringToDate('2022-11-29T20:00:00+01:00'),
        new Date('2022-11-29T20:00:00+01:00')
      );
    });

    test('it returns first date when array of strings', function (assert) {
      assert.deepEqual(
        parseDateStringToDate([
          '2023-01-26T19:35:00+01:00',
          '2022-11-29T20:00:00+01:00',
        ]),
        new Date('2023-01-26T19:35:00+01:00')
      );
    });

    test('it returns undefined when no input', function (assert) {
      assert.deepEqual(parseDateStringToDate(), undefined);
    });

    test('it returns undefined when wrong string', function (assert) {
      assert.deepEqual(parseDateStringToDate('wrong-string'), undefined);
    });
  });
});
