import JSONAPISerializer from '@ember-data/serializer/json-api';

/* eslint-disable ember/no-mixins */
// @ts-expect-error the addon ships no types
import DataTableSerializerMixin from 'ember-data-table/mixins/serializer';

export default class ApplicationSerializer extends JSONAPISerializer.extend(
  DataTableSerializerMixin,
) {}
