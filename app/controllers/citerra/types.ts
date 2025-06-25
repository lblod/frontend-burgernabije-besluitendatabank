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
