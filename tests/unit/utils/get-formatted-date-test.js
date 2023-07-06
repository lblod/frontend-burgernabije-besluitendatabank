import { module, test } from 'qunit';
import { getFormattedDate } from 'frontend-burgernabije-besluitendatabank/utils/get-formatted-date';

module('Unit | Utility | get-formatted-date', function () {
  test('returns empty string when date is missing', function (assert) {
    const result = getFormattedDate();

    assert.equal(result, '');
  });

  test('returns formatted date when date is valide', function (assert) {
    const result = getFormattedDate(new Date('2020-12-21'));

    assert.equal(result, '21/12/2020');
  });
});
