import Controller from '@ember/controller';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import LocationModel from 'frontend-burgernabije-besluitendatabank/models/location';
import MapRoute from 'frontend-burgernabije-besluitendatabank/routes/map';
import { Feature, FeatureCollection } from 'geojson';
import { feature } from 'topojson-client';
import { Topology } from 'topojson-specification';
import { ModelFrom } from '../lib/type-utils';

export default class MapComponent extends Controller {
  @service declare router: RouterService;
  declare model: ModelFrom<MapRoute>;

  @tracked locationData: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  @tracked agendaData: Array<AgendaItemModel> = [];

  @tracked provincesData?: FeatureCollection = {
    type: 'FeatureCollection',
    features: [],
  };
  @tracked features?: Map<string, Feature>;
  @tracked width = 800;
  @tracked height = 400;
  @tracked container = d3.select('.bp-map');

  @tracked tooltip = d3.select('#tooltip');
  @tracked cursor?: HTMLElement =
    document.querySelector('#tooltip') || undefined;

  @tracked svg = this.container
    .append('svg')
    .attr('viewBox', [0, 0, this.width, this.height]);

  @tracked g = this.svg.append('g');

  @tracked projection = geoMercator().scale(13400).translate([-590, 14120]);

  @tracked path: d3.GeoPath = geoPath().projection(this.projection);

  @action
  initMap() {
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (this.cursor) {
        this.cursor.style.left = x + 'px';
        this.cursor.style.top = y + 'px';
      }
    });

    this.map();
  }

  @action async drawMap() {
    console.log(Array(this.locationData));
    this.g
      .selectAll('path')
      .data(this.locationData.features)
      .enter()
      .append('path')
      .attr('class', 'municipalities')
      .attr('id', (locationDataItem: any) => {
        const name = locationDataItem.properties?.['name_nl'];
        return name;
      })
      .attr('d', this.path)
      .attr('fill', (locationDataItem: Feature) => {
        const name = locationDataItem.properties?.['name_nl'];
        this.agendaData.forEach((agendaItem: AgendaItemModel) => {
          const agendaItemLocation = agendaItem.session?.municipality;
          if (name === agendaItemLocation) {
            const datenow = new Date(Date.now()).setHours(0, 0, 0, 0);
            const f = agendaItem.session?.plannedStart;
            if (f) {
              const dateplan = f.getTime();
              if (dateplan > datenow || dateplan == datenow) {
                return d3.select('#' + name).style('fill', '#FFC515');
              }
            }
            return d3.select('#' + name).style('fill', '#5990DE');
          }
        });
        return '#e1e5e8';
      })
      .on('mouseover', (locationDataItem: any) => {
        this.tooltip.transition().style('visibility', 'visible');
        const name = locationDataItem.target.id;
        this.over(name);
      })
      .on('click', (locationDataItem: any) => {
        this.router.transitionTo('municipality', locationDataItem.target.id);
      })
      .on('mouseout', () => {
        this.tooltip.transition().style('visibility', 'hidden');
      });

    this.g
      .append('g')
      .selectAll('path')
      .data(Array(this.provincesData))
      .enter()
      .append('path')
      .attr('stroke-linejoin', 'round')
      .attr('class', 'provinces')
      .attr('d', this.path.toString());

    this.g
      .append('g')
      .selectAll('path')
      .data(Array(this.provincesData))
      .enter()
      .append('path')
      .attr('stroke-linejoin', 'round')
      .attr('class', 'provinces')
      .attr('d', this.path.toString());

    const legend = this.g.append('g');

    legend
      .append('rect')
      .attr('x', 635)
      .attr('y', 15)
      .attr('width', 8)
      .attr('height', 8)
      .attr('class', 'legend')
      .attr('fill', '#FFC515');

    legend
      .append('text')
      .attr('x', 650)
      .attr('y', 22)
      .attr('class', 'text_legend')
      .attr('fill', '#000')
      .text('Agenda komende zittingen');

    legend
      .append('rect')
      .attr('x', 635)
      .attr('y', 30)
      .attr('width', 8)
      .attr('height', 8)
      .attr('class', 'legend')
      .attr('fill', '#5990DE');

    legend
      .append('text')
      .attr('x', 650)
      .attr('y', 37)
      .attr('class', 'text_legend')
      .attr('fill', '#000')
      .text('Agenda recente 3 maanden');
  }

  @action async map() {
    d3.json('assets/api/vlaanderen.json').then(
      (value: unknown, error?: object) => {
        const data = value as Topology;
        if (error) {
          console.error(error);
        } else {
          const provinces = data.objects['provinces'];
          const municipalities = data.objects['municipalities'];

          if (provinces) {
            this.provincesData = feature(data, provinces) as FeatureCollection;
          }

          if (municipalities) {
            this.locationData = feature(
              data,
              municipalities
            ) as FeatureCollection;
          }

          this.features = new Map(
            this.locationData.features.map((d: Feature) => [
              d.properties?.['name_nl'],
              d,
            ])
          );

          this.drawMap();
        }
      }
    );
  }
  @action async over(nameFromHover: string) {
    const munName = this.model.locationData.find(
      (locationDataEntry: LocationModel) => {
        return locationDataEntry.label === nameFromHover;
      }
    );

    const tooltip = document.querySelector('#tooltip');

    if (munName?.label && tooltip) {
      return (tooltip.innerHTML = `<span class="gemeente">${munName.label}</span>`);
    } else {
      return null;
    }
  }
}
