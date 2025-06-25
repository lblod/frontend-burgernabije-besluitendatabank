export type EntityOption = {
  label: string;
  value: 'individual' | 'business';
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
