export const REQUIREMENTS_QUERY = (data: {
  userSelectedAdminUnit: string;
  userSelectedZone: string;
  userSelectedType: string;
  userSelectedReason: string;
}) => `PREFIX besluit: <http://data.vlaanderen.be/ns/besluit#>
PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX cpsv: <http://purl.org/vocab/cpsv#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX belgif: <http://vocab.belgif.be/ns/publicservice#>
PREFIX m8g: <http://data.europa.eu/m8g/>
PREFIX locn: <http://www.w3.org/ns/locn#>
PREFIX citerra: <https://data.vlaanderen.be/ns/mobiliteit-intelligente-toegang#>

SELECT DISTINCT ?userSelectedAdminUnit ?situationReq ?description ?evidenceDescription ?requesterType WHERE {

  # Logic operators
  VALUES (?or ?and) {
    (<https://data.vlaanderen.be/id/concept/IntelligenteToegang-LogischeOperatie/be81ccdc-71d3-4730-8301-be3386ca0b5e>
     <https://data.vlaanderen.be/id/concept/IntelligenteToegang-LogischeOperatie/b872e78b-6d5f-41ee-aa0a-8ee8c141c7cc>)
  }
  # Type constraints
  VALUES ?reqTypeZone {
    <https://data.vlaanderen.be/id/concept/IntelligenteToegang-TypeVoorwaarde/d5c0c89a-3ba4-49fd-bfe4-f41405b4cbf1>
  }
  VALUES ?reqTypeUser {
    <https://data.vlaanderen.be/id/concept/IntelligenteToegang-TypeVoorwaarde/0d903f9f-730b-45ed-9f04-d2449d7a8018>
  }
  VALUES ?reqTypeReason {
    <https://data.vlaanderen.be/id/concept/IntelligenteToegang-TypeVoorwaarde/0bfeab4c-a69b-44cd-9a2c-6fd18ebd5761>
  }

  # User input
  VALUES ?userSelectedType {
    <${data.userSelectedType}>
  }

  VALUES ?userSelectedReason {
    <${data.userSelectedReason}>
  }

  VALUES ?userSelectedAdminUnit {
    ${data.userSelectedAdminUnit}
  }

  VALUES ?userSelectedZone {
    ${data.userSelectedZone}
  }


  # Get most recent public service linked to selected admin unit
  {
    SELECT ?service WHERE {
  ?zitting besluit:isGehoudenDoor ?userSelectedAdminUnit.
  ?zitting besluit:heeftUittreksel ?u.
  ?u prov:wasDerivedFrom ?publication.
  ?u ext:createdOnTimestamp ?publicationDate.
  ?service prov:wasDerivedFrom ?publication.
  ?service a cpsv:PublicService.
    } ORDER BY DESC(?publicationDate)
  }


  ?service belgif:hasRequirement ?topLevelReq.

  # Access structure: service → requirement tree
  ?topLevelReq m8g:hasRequirement ?modality.
  ?modality m8g:hasRequirement ?zoneBlock.
  ?zoneBlock citerra:operatie ?or.
  ?zoneBlock m8g:hasRequirement ?zone.
  ?zone dct:type ?reqTypeZone.
  ?zone ext:expectedValue ?userSelectedZone.

  # Get rules
  ?modality m8g:hasRequirement ?rule.
  ?rule citerra:operatie ?or.
  ?rule m8g:hasRequirement ?situation.
  ?situation citerra:operatie ?and.

  # User type condition
  ?situation m8g:hasRequirement ?userType.
  ?userType dct:type ?reqTypeUser.
  ?userType ext:expectedValue ?userSelectedType.

  # Reason condition
  ?situation m8g:hasRequirement ?reason.
  ?reason dct:type ?reqTypeReason.
  ?reason ext:expectedValue ?userSelectedReason.

  # Retrieve requirements
  ?situation m8g:hasRequirement ?situationReq.

  OPTIONAL {
    ?situationReq dct:description ?description.
    ?situationReq ext:expectedValue ?requesterType.
  }

  OPTIONAL {
    ?situationReq m8g:hasEvidenceTypeList ?evidenceList.
    ?evidenceList m8g:specifiesEvidenceType ?evidenceType.
    ?evidenceType dct:description ?evidenceDescription.
  }
}
LIMIT 1000`;
