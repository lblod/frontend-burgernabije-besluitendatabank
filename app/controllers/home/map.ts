import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import axios from "axios";
import d3 from "d3";
import { geoMercator, geoPath } from "d3-geo";
import topojson from "topojson";

export default class MapComponent extends Controller {
  @service declare router: RouterService;
  @action
  initMap() {
    let provincesData: any;
    let gemeenteData: any;
    const router = this.router;
    let mandatenData: any;
    let features: any;
    let agendaData: any;
    let besluitData;
    const width = 800;
    const height = 400;
    const container = d3.select(".bp-map");

    const tooltip = d3.select("#tooltip");
    const cursor: any = document.querySelector("#tooltip");
    document.addEventListener("mousemove", function (e) {
      var x = e.clientX;
      var y = e.clientY;
      cursor.style.left = x + "px";
      cursor.style.top = y + "px";
    });

    const svg = container.append("svg").attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g");

    const projection = geoMercator().scale(13400).translate([-590, 14120]);

    const path: any = geoPath().projection(projection);

    async function drawMap() {
      g.selectAll("path")
        .data(gemeenteData)
        .enter()
        .append("path")
        .attr("class", "municipalities")
        .attr("id", (gemeenteDataItem: any) => {
          let name = gemeenteDataItem.properties["name_nl"];
          return name;
        })
        .attr("d", path)
        .attr("fill", (gemeenteDataItem: any) => {
          let name = gemeenteDataItem.properties["name_nl"];
          agendaData.forEach((e: any) => {
            if (name === e.name) {
              const datenow = new Date(Date.now()).setHours(0, 0, 0, 0); // toDateString()
              const f = new Date(e.geplandeStart);
              const dateplan = f.getTime();
              // console.log(name, d.geplandeStart, dateplan > datenow || dateplan == datenow)
              if (dateplan > datenow || dateplan == datenow) {
                return d3.select("#" + name).style("fill", "#FFC515");
              }
              return d3.select("#" + e.name).style("fill", "#5990DE");
            }
          });
          //  issue: doesn't show De Panne
          return "#e1e5e8";
        })
        .on("mouseover", (gemeenteDataItem) => {
          tooltip.transition().style("visibility", "visible");
          let name = gemeenteDataItem.target.id;
          over(name);
        })
        .on("click", (gemeenteDataItem) => {
          //  d3.select(".indexClick").transition().style("visibility", "visible")
          console.log(gemeenteDataItem);
          router.transitionTo("municipality", gemeenteDataItem.target.id);
        })
        .on("mouseout", (gemeenteDataItem) => {
          tooltip.transition().style("visibility", "hidden");
        });

      g.append("g")
        .selectAll("path")
        .data(provincesData)
        .enter()
        .append("path")
        .attr("stroke-linejoin", "round")
        .attr("class", "provinces")
        .attr("d", path);

      g.append("g")
        .selectAll("path")
        .data(provincesData)
        .enter()
        .append("path")
        .attr("stroke-linejoin", "round")
        .attr("class", "provinces")
        .attr("d", path);

      const legend = g.append("g");

      // komende agenda
      legend
        .append("rect")
        .attr("x", 635)
        .attr("y", 15)
        .attr("width", 8)
        .attr("height", 8)
        .attr("class", "legend")
        .attr("fill", "#FFC515");

      legend
        .append("text")
        .attr("x", 650)
        .attr("y", 22)
        .attr("class", "text_legend")
        .attr("fill", "#000")
        .text("Agenda komende zittingen");

      // legend agenda
      legend
        .append("rect")
        .attr("x", 635)
        .attr("y", 30)
        .attr("width", 8)
        .attr("height", 8)
        .attr("class", "legend")
        .attr("fill", "#5990DE");

      legend
        .append("text")
        .attr("x", 650)
        .attr("y", 37)
        .attr("class", "text_legend")
        .attr("fill", "#000")
        .text("Agenda recente 3 maanden");
    }
    const map = async () =>
      //@ts-ignore
      d3.json("assets/api/vlaanderen.json").then((data: any, error: any) => {
        if (error) {
          console.error(error);
        } else {
          provincesData = topojson.feature(
            data,
            data.objects.provinces
            //@ts-ignore
          ).features;
          gemeenteData = topojson.feature(
            data,
            data.objects.municipalities
            //@ts-ignore
          ).features;
          ``;

          features = new Map(
            topojson
              .feature(data, data.objects.municipalities)
              //@ts-ignore
              .features.map((d) => [d.properties.name_nl, d])
          );

          // console.log(gemeenteData);
          mandatenData = fetch_mandataris()
            .then((result: any) => {
              const datas = result.data.results["bindings"];
              const realdata: any = [];
              datas.forEach((e: any) => {
                realdata.push({
                  start: e.start.value,
                  eind: e.eind,
                  achternaam: e.achternaam.value,
                  voornaam: e.voornaam.value,
                  fractie: e.fractie,
                  bestuurseenheidnaam: e.bestuurseenheidnaam.value,
                });
              });
              return realdata;
            })
            .catch(function (error) {
              console.log("Failed!", error);
            });

          hasAgenda().then((result) => {
            agendaData = result;
            hasBesluit().then((result) => {
              besluitData = result;
              drawMap();
            }); //hasBesluit
          }); //hasAgenda
        }
      });
    map();

    async function over(name: any) {
      let eenBurgemeester: any = [];
      mandatenData.then((info: any) => {
        let input_name = info.find(
          (hu: any) => hu.bestuurseenheidnaam === name
        );
        let put_name = input_name.bestuurseenheidnaam;
        let bestuurseenheids = d3.group(
          info,
          (d: any) => d.bestuurseenheidnaam
        ); //d3.group(info, d => d[19]);
        let bestuurseenheid: any = bestuurseenheids.get(put_name);
        let formatTime = new Date();
        let today = formatTime.getTime();
        let bestuurperiod = new Date("1/1/2019");
        let period_Start = bestuurperiod.getTime();
        bestuurseenheid.forEach((burgemeesters: any) => {
          let start_date = new Date(burgemeesters.start);
          let bestuur_Start = start_date.getTime();
          let end_date = new Date(burgemeesters.eind);
          let bestuur_End = end_date.getTime();
          if (+period_Start <= +bestuur_Start && !(+bestuur_End <= +today)) {
            eenBurgemeester.push({
              voornaam: burgemeesters.voornaam,
              achternaam: burgemeesters.achternaam,
              fractie: burgemeesters.fractie,
            });
            return eenBurgemeester;
          } //end condition
        });
        if (!eenBurgemeester[0].fractie) {
          return (document.querySelector(
            "#tooltip"
          )!.innerHTML = `<span class="gemeente">${name}</span> | ${
            eenBurgemeester[0].voornaam
          } ${eenBurgemeester[0].achternaam} ${[eenBurgemeester[0].fractie]} `);
        } else {
          const classColor = eenBurgemeester[0].fractie.value;
          switch (classColor) {
            case "N-VA":
            case "Groen":
            case "Vooruit":
            case "CD&V":
            case "CD&V+":
            case "Open":
            case "Open-Vld":
            case "Vlaams":
            case "TEAM":
            case "Lijst":
          }
          return (document.querySelector(
            "#tooltip"
          )!.innerHTML = `<span class="gemeente">${name}</span> | ${eenBurgemeester[0].voornaam} ${eenBurgemeester[0].achternaam} <span class="fractie ${classColor}">${eenBurgemeester[0].fractie.value}</span>`);
        }
      });
    }

    async function fetch_mandataris() {
      const endpointUrl = "https://centrale-vindplaats.lblod.info/sparql";
      const results: any = [];
      return await axios
        .get(
          "https://qa.centrale-vindplaats.lblod.info/sparql?query=" +
            encodeURIComponent(
              `
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
          PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
          PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
          PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

          SELECT DISTINCT ?start ?eind ?achternaam ?voornaam ?bestuursfunctie ?fractie ?bestuurseenheidnaam WHERE {
          ?mandataris a mandaat:Mandataris .
          ?mandataris mandaat:start ?start.
          OPTIONAL {?mandataris mandaat:einde ?eind.}
          OPTIONAL {?mandataris mandaat:rangorde ?rangorde.}
          OPTIONAL {?mandataris mandaat:beleidsdomein ?beleid;
                    skos:prefLabel ?beleidsdomein.}

          ?mandataris mandaat:isBestuurlijkeAliasVan ?person .
          ?person a <http://www.w3.org/ns/person#Person> .
          ?person <http://xmlns.com/foaf/0.1/familyName> ?achternaam .
          ?person <http://data.vlaanderen.be/ns/persoon#gebruikteVoornaam> ?voornaam.

          ?mandataris <http://www.w3.org/ns/org#holds> ?functie .
          ?functie <http://www.w3.org/ns/org#role> ?rol .
          ?rol <http://www.w3.org/2004/02/skos/core#prefLabel> 'Burgemeester' .

          OPTIONAL {?mandataris <http://www.w3.org/ns/org#hasMembership> ?lid .
                ?lid <http://www.w3.org/ns/org#organisation> ?o.
                ?o a mandaat:Fractie.
                ?o <https://www.w3.org/ns/regorg#legalName> ?fractie.}

          ?mandataris <http://www.w3.org/ns/org#holds> ?manda .
          ?manda a mandaat:Mandaat .
          ?specializationInTime <http://www.w3.org/ns/org#hasPost> ?manda.
          ?manda <http://www.w3.org/ns/org#role> ?bo .
          ?bo <http://www.w3.org/2004/02/skos/core#prefLabel> ?bestuursorgaanTijd .
          ?specializationInTime mandaat:isTijdspecialisatieVan ?boo  .
          ?boo <http://www.w3.org/2004/02/skos/core#prefLabel> ?bestuursorgaan .
          ?boo besluit:classificatie ?classificatie.
          ?classificatie skos:prefLabel ?bestuursclassificatie .
          ?boo besluit:bestuurt ?s .
          ?s a besluit:Bestuurseenheid .
          ?s besluit:werkingsgebied [rdfs:label ?bestuurseenheidnaam]

          FILTER (?eind >= xsd:date(NOW()) || NOT EXISTS {?mandataris mandaat:einde ?eind.} )
          }

          ORDER BY ASC(?bestuurseenheidnaam) ASC(?fractie) ASC(?voornaam)
      `
            ),
          {
            headers: {
              Accept: "application/sparql-results+json",
            },
          }
        )
        //@ts-ignore
        .then(results);
    }

    async function hasAgenda() {
      const results: any = [];
      const data_qa: any = await axios
        .get(
          "https://qa.centrale-vindplaats.lblod.info/sparql?query=" +
            encodeURIComponent(
              `
      PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
      PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX terms: <http://purl.org/dc/terms/>
      PREFIX title: <http://purl.org/dc/terms/title>
      PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
      PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT DISTINCT  ?filterDate1 ?bestuurseenheidnaam WHERE {
        ?zitting a besluit:Zitting .
        ?zitting besluit:geplandeStart ?geplandeStart .
        OPTIONAL { ?zitting <http://www.w3.org/ns/prov#atLocation> ?location}

        ?zitting besluit:behandelt ?agendapunt.
        ?agendapunt a besluit:Agendapunt .
        ?agendapunt terms:title ?title .
        BIND(str(?title) AS ?title_agenda)
        OPTIONAL { ?agendapunt terms:description ?description .
          ?agendapunt besluit:geplandOpenbaar ?OpenbaarOfNiet .
          BIND (IF(?openbaarOfNiet = 1, "Openbaar", "Openbaar niet") as ?geplandOpenbaar)
        }

        {
          ?zitting a besluit:Zitting.
          ?zitting besluit:isGehoudenDoor ?bestuursorgaan.
          ?bestuursorgaan besluit:classificatie ?classificatie.
          ?classificatie skos:prefLabel ?bestuursclassificatie .
          ?bestuursorgaan besluit:bestuurt ?eenheid.
          ?eenheid a besluit:Bestuurseenheid .
          ?eenheid besluit:werkingsgebied [rdfs:label ?bestuurseenheidnaam].
        }
        UNION
        {
          ?zitting a besluit:Zitting.
          ?zitting besluit:isGehoudenDoor ?bestuursorgaanInTijd.
          ?bestuursorgaanInTijd mandaat:isTijdspecialisatieVan ?bestuursorgaan.
          ?bestuursorgaan besluit:classificatie ?classificatie.
          ?classificatie skos:prefLabel ?bestuursclassificatie .
          ?bestuursorgaan besluit:bestuurt ?eenheid.
          ?eenheid a besluit:Bestuurseenheid .
          ?eenheid besluit:werkingsgebied [rdfs:label ?bestuurseenheidnaam].
        }

        FILTER(?bestuursclassificatie = "Gemeenteraad" || ?bestuursclassificatie = "Raad voor Maatschappelijk Welzijn")

        BIND(day(now()) AS ?day)
        BIND(IF(?day < 10, "-0", "-") AS ?day2)
        BIND(month(now()) - 3 AS ?month)
        BIND(IF(?month < 1, ?month + 12, ?month) AS ?month2)
        BIND(IF(?month2 < 10, "-0", "-") AS ?month3)
        BIND(year(now()) AS ?year)
        BIND(IF(?month < 1, ?year - 1, ?year) AS ?year2)
        BIND(CONCAT(?year2, ?month3, ?month2, ?day2, ?day) as ?dayTofilter)
        BIND(STRDT(?dayTofilter, xsd:date) AS ?filterDate)

        BIND(day(?geplandeStart) AS ?day5)
        BIND(IF(?day5 < 10, "-0", "-") AS ?day6)
        BIND(month(?geplandeStart) AS ?month5)
        BIND(IF(?month5 < 1, ?month5 + 12, ?month5) AS ?month6)
        BIND(IF(?month6 < 10, "-0", "-") AS ?month7)
        BIND(year(?geplandeStart) AS ?year5)
        BIND(IF(?month5 < 1, ?year5 - 1, ?year5) AS ?year6)
        BIND(CONCAT(?year6, ?month7, ?month6, ?day6, ?day5) as ?dayTofilter1)
        BIND(STRDT(?dayTofilter1, xsd:date) AS ?filterDate1)
        FILTER (?geplandeStart > ?filterDate || ?geplandeStart = ?filterDate)
      }
      GROUP BY (?bestuurseenheidnaam)
      ORDER BY DESC(?geplandeStart)
      `
            ),
          {
            headers: {
              Accept: "application/sparql-results+json",
            },
          }
        )
        //@ts-ignore
        .then(results);
      const realdata: any = [];
      data_qa.data.results.bindings.forEach((e: any) => {
        realdata.push({
          bestuurseenheidnaam: e.bestuurseenheidnaam.value,
          // geplandeStart: e.filterDate1.value,
          geplandeStart: e.filterDate1.value,
        });
      });

      const hu = d3.group(realdata, (d: any) => d.bestuurseenheidnaam);
      const eenheidnaam: any = [];
      for (const [key, value] of hu) {
        eenheidnaam.push({
          bestuurseenheidnaam: key,
          //@ts-ignore
          geplandeStart: value[0].geplandeStart,
        });
      }
      const agendadata: any = [];
      console.log(features["Symbol"]);
      eenheidnaam.forEach((e: any) => {
        const feature: any = features.get(e.bestuurseenheidnaam);
        console.log(feature);
        agendadata.push({
          position: feature && path.centroid(feature),
          name: feature && feature.properties.name_nl,
          geplandeStart: e.geplandeStart,
        });
      });

      agendadata.filter((d: any) => d.position);
      // console.log(agendadata);
      agendadata.sort(
        (a: any, b: any) =>
          d3.ascending(a.position[1], b.position[1]) ||
          d3.ascending(a.position[0], b.position[0])
      );
      return agendadata;
    }

    async function hasBesluit() {
      const results: any = [];
      const data_qa: any = await axios
        .get(
          "https://qa.centrale-vindplaats.lblod.info/sparql?query=" +
            encodeURIComponent(
              `
            PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
            PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
            PREFIX persoon: <http://data.vlaanderen.be/ns/persoon#>
            PREFIX prov: <http://www.w3.org/ns/prov#>
            PREFIX ontology: <http://data.europa.eu/eli/ontology#>
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            PREFIX terms: <http://purl.org/dc/terms/>
            PREFIX familyName: <http://xmlns.com/foaf/0.1/familyName>
            PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
            PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

                SELECT DISTINCT ?bestuurseenheidnaam WHERE {

                ?zitting a besluit:Zitting ;
                besluit:geplandeStart ?geplandeStart;
                besluit:behandelt ?agendapunt .

              ?behandelingAgendapunt a besluit:BehandelingVanAgendapunt;
                                terms:subject ?agendapunt;
                          prov:generated ?decision.
              ?behandelingAgendapunt prov:generated ?decision.
              ?behandelingAgendapunt besluit:openbaar ?openbaar .
              FILTER(?openbaar)
                        ?decision ontology:title ?titles.

              {
              ?zitting besluit:isGehoudenDoor ?bo .
              ?bo besluit:classificatie ?classificatie.
              ?classificatie skos:prefLabel ?bestuursclassificatie .
              ?bo besluit:bestuurt ?s .
              ?s a besluit:Bestuurseenheid .
              ?s besluit:werkingsgebied [rdfs:label ?bestuurseenheidnaam].
              }
                UNION
              {
                ?zitting a besluit:Zitting.
                ?zitting besluit:isGehoudenDoor ?bestuursorgaanInTijd.
                ?bestuursorgaanInTijd mandaat:isTijdspecialisatieVan ?boo  .
                ?boo besluit:classificatie ?classificatie.
                ?classificatie skos:prefLabel ?bestuursclassificatie .
                ?boo besluit:bestuurt ?s .
                ?s a besluit:Bestuurseenheid .
                ?s besluit:werkingsgebied [rdfs:label ?bestuurseenheidnaam].

              }

              FILTER(?bestuursclassificatie = "Gemeenteraad" || ?bestuursclassificatie = "Raad voor Maatschappelijk Welzijn")

              BIND(day(now()) AS ?day)
              BIND(IF(?day < 10, "-0", "-") AS ?day2)
              BIND(month(now()) - 4 AS ?month)
              BIND(IF(?month < 1, ?month + 12, ?month) AS ?month2)
              BIND(IF(?month2 < 10, "-0", "-") AS ?month3)
              BIND(year(now()) AS ?year)
              BIND(IF(?month < 1, ?year - 1, ?year) AS ?year2)
              BIND(CONCAT(?year2, ?month3, ?month2, ?day2, ?day) as ?dayTofilter)
              BIND(STRDT(?dayTofilter, xsd:date) AS ?filterDate)
              FILTER (?geplandeStart > ?filterDate || ?geplandeStart = ?filterDate)
                }
            ORDER BY DESC(?geplandeStart)
            `
            ),
          {
            headers: {
              Accept: "application/sparql-results+json",
            },
          }
        )
        //@ts-ignore
        .then(results);
      const realdata: any = [];
      data_qa.data.results.bindings.forEach((e: any) => {
        realdata.push(e.bestuurseenheidnaam.value);
      });
      const result: any = [];
      realdata.forEach((e: any) => result.push({ e }));
      return result;
    }
  }
}
