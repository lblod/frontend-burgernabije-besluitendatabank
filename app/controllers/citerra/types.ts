export type EntityOption = {
  label: string;
  value: 'individual' | 'business';
};
export type TravelReasonOption = {
  label: string;
  value: string;
};
export interface AreaParams {
  name: string;
  coordinates: { lat: number; lng: number }[];
}
