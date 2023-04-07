export const getAllAgendaItemsQuery = ({
  municipality,
  offset = 0,
}: {
  municipality?: string;
  offset?: number;
}): string => {
  return `PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX terms: <http://purl.org/dc/terms/>
PREFIX title: <http://purl.org/dc/terms/title>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?geplandeStart ?location ?title_agenda ?description ?bestuursclassificatie ?eenheid_werkingsgebied_label WHERE {
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
    ?eenheid besluit:werkingsgebied ?eenheid_werkingsgebied.
    ?eenheid_werkingsgebied rdfs:label ?eenheid_werkingsgebied_label.
    ${
      municipality !== undefined && municipality !== null
        ? `?eenheid besluit:werkingsgebied [rdfs:label "${municipality}"].`
        : ""
    }
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
    ?eenheid besluit:werkingsgebied ?eenheid_werkingsgebied.
    ?eenheid_werkingsgebied rdfs:label ?eenheid_werkingsgebied_label.
    ${
      municipality !== undefined && municipality !== null
        ? `?eenheid besluit:werkingsgebied [rdfs:label "${municipality}"].`
        : ""
    }
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
          BIND(xsd:date(now()) AS ?time)
          BIND(STRDT(?dayTofilter, xsd:date) AS ?filterDate)
          FILTER (?geplandeStart > ?filterDate || ?geplandeStart = ?filterDate)
        }
        ORDER BY DESC(?geplandeStart) xsd:integer( ?title_agenda ) ASC(?title_agenda)
LIMIT 3
OFFSET ${offset}
`;
};

export const getOneAgendaItemByTitle = ({
  title,
}: {
  title: string;
}): string => {
  return `PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX mandaat: <http://data.vlaanderen.be/ns/mandaat#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX terms: <http://purl.org/dc/terms/>
PREFIX title: <http://purl.org/dc/terms/title>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT DISTINCT ?geplandeStart ?location ?title_agenda ?description ?bestuursclassificatie ?eenheid_werkingsgebied_label WHERE {
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
    ?eenheid besluit:werkingsgebied ?eenheid_werkingsgebied.
    ?eenheid_werkingsgebied rdfs:label ?eenheid_werkingsgebied_label.
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
    ?eenheid besluit:werkingsgebied ?eenheid_werkingsgebied.
    ?eenheid_werkingsgebied rdfs:label ?eenheid_werkingsgebied_label.
  }


          FILTER(?bestuursclassificatie = "Gemeenteraad" || ?bestuursclassificatie = "Raad voor Maatschappelijk Welzijn")
          FILTER(?title_agenda = "${title}")
          BIND(day(now()) AS ?day)
          BIND(IF(?day < 10, "-0", "-") AS ?day2)
          BIND(month(now()) - 3 AS ?month)
          BIND(IF(?month < 1, ?month + 12, ?month) AS ?month2)
          BIND(IF(?month2 < 10, "-0", "-") AS ?month3)
          BIND(year(now()) AS ?year)
          BIND(IF(?month < 1, ?year - 1, ?year) AS ?year2)
          BIND(CONCAT(?year2, ?month3, ?month2, ?day2, ?day) as ?dayTofilter)
          BIND(xsd:date(now()) AS ?time)
          BIND(STRDT(?dayTofilter, xsd:date) AS ?filterDate)
          FILTER (?geplandeStart > ?filterDate || ?geplandeStart = ?filterDate)
        }
        ORDER BY DESC(?geplandeStart) xsd:integer( ?title_agenda ) ASC(?title_agenda)
LIMIT 1
`;
};

export const getAllMunicipalitiesQuery = () => {
  return `
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
`;
};
