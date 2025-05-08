import type { EntityOption, TravelReasonOption } from './types';

// This file will be removed in the future
export const defaultEntityTypes: EntityOption[] = [
  { label: 'Een privé persoon', value: 'individual' },
  { label: 'Een onderneming', value: 'business' },
];

export const defaultTravelReasons: TravelReasonOption[] = [
  { label: 'Zaken', value: 'business' },
  { label: 'Bezoek familie', value: 'family' },
  { label: 'Ik woon hier', value: 'home' },
  { label: 'Werk of woon-werkverkeer', value: 'work' },
  { label: 'Medische afspraak of zorgverlening', value: 'medical' },
  { label: 'Bezoek aan een bewoner', value: 'visit' },
  { label: 'Levering of ophalen van goederen', value: 'delivery' },
  { label: 'Hulp bij verhuis of renovatie', value: 'relocation' },
  { label: 'Taxi- of vervoersdienst', value: 'transport-service' },
  { label: 'Recreatie of toerisme', value: 'leisure' },
  { label: 'Onderhoud of technische interventie', value: 'maintenance' },
  { label: 'Bezoek aan een overheidsinstelling', value: 'government-visit' },
  { label: 'Religieuze of culturele activiteit', value: 'cultural' },
  { label: 'Ophalen of afzetten van kinderen', value: 'school-dropoff' },
  { label: 'Tijdelijke toegang met vergunning', value: 'temporary-access' },
];
