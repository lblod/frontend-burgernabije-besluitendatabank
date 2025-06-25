export type EntityOption = {
  label: string;
  value: 'individual' | 'business';
  uri?: string;
};
export type TravelReasonOption = {
  label: string;
  value: string;
  uri?: string;
};
export interface AreaParams {
  name: string;
  municipality: string;
  coordinates: { lat: number; lng: number }[];
  uri?: string;
  publicationLinks?: string;
  govBody?: JsonApiResource;
}

export interface SparqlBinding {
  userSelectedAdminUnit?: { value: string };
  userSelectedZone?: { value: string };
  situationReq?: { value: string };
  description?: { value: string };
  evidenceDescription?: { value: string };
}

export type Requirement = {
  adminUnit: string;
  zone: string;
  requirement: string;
  description?: string | null;
  evidenceDescription?: string | null;
};

export type LatLngPoint = { lat: number; lng: number };
export type LambertCoord = [number, number];

export interface JsonApiResource {
  id: string;
  type: string;
  attributes: Record<string, string>;
  relationships?: Record<string, string>;
}

export interface JsonApiResponse {
  data: JsonApiResource[];
  included?: JsonApiResource[];
}
