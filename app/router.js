import EmberRouter from '@ember/routing/router';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('detail', { path: '/agendapunt/:id' });
  this.route('municipality', { path: '/gemeente/:municipality' });
  this.route('help');
  this.route('agenda-items', { path: '/agendapunten' });
  this.route('home', { path: '/' });
  this.route('map', { path: '/kaart' });
  this.route('sessions', { path: '/zittingen' }, function () {
    this.route('session', { path: '/:session_id' });
  });
  this.route('four-oh-four', { path: '/*path' });
});
