/*global vl*/
import { modifier } from 'ember-modifier';

export default modifier((element, [url]) => {
  // From https://vlaamseoverheid.atlassian.net/wiki/spaces/IKPubliek/pages/2327449182/Technische+documentatie+Widget-platform#Een-widget-toevoegen-aan-een-webpagina-via-Javascript
  // (visited on 25/10/2021)
  vl.widget.client.bootstrap(url).then(function (widget) {
    return widget.setMountElement(element).mount();
  });
});
