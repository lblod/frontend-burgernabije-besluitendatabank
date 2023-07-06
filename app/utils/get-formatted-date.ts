import { format } from 'date-fns';

export const getFormattedDate = (date: Date) =>
  date ? format(date, 'dd/MM/yyyy') : '';
