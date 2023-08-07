import { lightFormat, parseISO } from 'date-fns';

/**
 * Date formatter, allows consistent formatting across the application
 *
 * @param date a date to be formatted. Can either be a string or a Date object
 * @returns a formatted date string
 */
export default function isoFormatter(date: string | Date) {
  if (typeof date == 'string') {
    date = parseISO(date);
  }
  return lightFormat(date, 'MM/dd/yyyy');
}
