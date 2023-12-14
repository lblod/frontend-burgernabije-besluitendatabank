import EmbroiderRouter from '@embroider/router';
import config from 'frontend-lokaalbeslist/config/environment';

export default class Router extends EmbroiderRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('municipality', { path: '/gemeente/:municipality' });
  this.route('home', { path: '/' });

  this.route('agenda-items', { path: '/agendapunten' }, function () {
    this.route('agenda-item', { path: '/:id' }, function () {
      this.route('session', { path: '/zitting' });
    });
  });

  this.route('sessions', { path: '/zittingen' }, function () {
    this.route('session', { path: '/:session_id' });
  });
  this.route('four-oh-four', { path: '/*path' });

  this.route('disclaimer');
  this.route('help');
  this.route('cookie-notice', { path: '/cookieverklaring' });
  this.route('accessibility-statement', {
    path: '/toegankelijkheidsverklaring',
  });
  this.route('data-quality', { path: '/data-kwaliteit' });
});
