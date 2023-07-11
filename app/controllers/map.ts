import Controller from '@ember/controller';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as d3 from 'd3';
import { geoMercator, geoPath } from 'd3-geo';
import MapRoute from 'frontend-burgernabije-besluitendatabank/routes/map';
import * as topojson from 'topojson';
import { ModelFrom } from '../lib/type-utils';

export default class MapComponent extends Controller {
  @service declare router: RouterService;
  declare model: ModelFrom<MapRoute>;

  @tracked locationData: any = this.model.locationData.toArray();
  @tracked agendaData: any = this.model.agendaData.toArray();

  @tracked provincesData: any;
  @tracked features: any;
  @tracked width = 800;
  @tracked height = 400;
  @tracked container = d3.select('.bp-map');

  @tracked tooltip = d3.select('#tooltip');
  @tracked cursor: any = document.querySelector('#tooltip');

  @tracked svg = this.container
    .append('svg')
    .attr('viewBox', [0, 0, this.width, this.height]);

  @tracked g = this.svg.append('g');

  @tracked projection = geoMercator().scale(13400).translate([-590, 14120]);

  @tracked path: any = geoPath().projection(this.projection);

  @action
  initMap() {
    document.addEventListener('mousemove', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      this.cursor.style.left = x + 'px';
      this.cursor.style.top = y + 'px';
    });

    this.map();
  }

  @action async drawMap() {
    this.g
      .selectAll('path')
      .data(this.locationData)
      .enter()
      .append('path')
      .attr('class', 'municipalities')
      .attr('id', (locationDataItem: any) => {
        const name = locationDataItem.properties['name_nl'];
        return name;
      })
      .attr('d', this.path)
      .attr('fill', (locationDataItem: any) => {
        const name = locationDataItem.properties['name_nl'];
        this.agendaData.forEach((agendaItem: any) => {
          const agendaItemLocation = agendaItem
            .get('session')
            ?.get('governingBody')
            ?.get('administrativeUnit')?.name;
          if (name === agendaItemLocation) {
            const datenow = new Date(Date.now()).setHours(0, 0, 0, 0);
            const f = new Date(agendaItem.geplandeStart);
            const dateplan = f.getTime();
            if (dateplan > datenow || dateplan == datenow) {
              return d3.select('#' + name).style('fill', '#FFC515');
            }
            return d3.select('#' + name).style('fill', '#5990DE');
          }
        });
        return '#e1e5e8';
      })
      .on('mouseover', (locationDataItem) => {
        this.tooltip.transition().style('visibility', 'visible');
        const name = locationDataItem.target.id;
        this.over(name);
      })
      .on('click', (locationDataItem) => {
        this.router.transitionTo('municipality', locationDataItem.target.id);
      })
      .on('mouseout', (locationDataItem) => {
        this.tooltip.transition().style('visibility', 'hidden');
      });

    this.g
      .append('g')
      .selectAll('path')
      .data(this.provincesData)
      .enter()
      .append('path')
      .attr('stroke-linejoin', 'round')
      .attr('class', 'provinces')
      .attr('d', this.path);

    this.g
      .append('g')
      .selectAll('path')
      .data(this.provincesData)
      .enter()
      .append('path')
      .attr('stroke-linejoin', 'round')
      .attr('class', 'provinces')
      .attr('d', this.path);

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
    //@ts-ignore
    d3.json('assets/api/vlaanderen.json').then((data: any, error: any) => {
      if (error) {
        console.error(error);
      } else {
        this.provincesData = topojson.feature(
          data,
          data.objects.provinces
          //@ts-ignore
        ).features;
        this.locationData = topojson.feature(
          data,
          data.objects.municipalities
          //@ts-ignore
        ).features;
        ``;

        this.features = new Map(
          topojson
            .feature(data, data.objects.municipalities)
            //@ts-ignore
            .features.map((d) => [d.properties.name_nl, d])
        );
        // const realdata: any = [];
        // this.mandatenData = this.model.mandatenData.toArray().map((e: any) => {
        //   realdata.push({
        //     start: e.startDate,
        //     end: e.endDate,
        //     firstName: e.alias.get("firstNameUsed"),
        //     familyName: e.alias.get("familyName"),
        //     fraction: e.hasMembership.get("innerGroup")
        //       ? e.hasMembership.get("innerGroup").get("name")
        //       : "Geen Fractie",
        //   });
        //   return realdata;
        // });

        this.drawMap();
      }
    });
  }
  @action async over(nameFromHover: any) {
    const munName = this.model.locationData
      .toArray()
      .find((locationDataEntry: any) => {
        return locationDataEntry.label === nameFromHover;
      });

    return munName.label
      ? (document.querySelector(
          '#tooltip'
        )!.innerHTML = `<span class="gemeente">${munName.label}</span>`)
      : null;
  }
}
