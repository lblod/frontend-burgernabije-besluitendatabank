import Helper from '@ember/component/helper';

export function formatNumber(params: [number]): string {
  const number = params[0];

  // Check if the input is a valid number
  if (isNaN(number) || number === null) {
    return '';
  }

  // Convert number to string
  const formattedNumber = number.toString();

  // Split the number into integer and decimal parts
  const parts = formattedNumber.split('.');

  // Format the integer part with commas
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // Join the integer and decimal parts with a period
  return parts.join('.');
}

export default class FormatNumberHelper extends Helper {
  compute(params: [number]): string {
    return formatNumber(params);
  }
}
