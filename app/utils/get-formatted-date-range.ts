import { getFormattedDate } from "./get-formatted-date";

export const getFormattedDateRange = (startDate?: Date, endDate?: Date) => {
  let formatted:Array<String> = [];

  // format date when available
  if (startDate) formatted.push(getFormattedDate(startDate));
  if (endDate) formatted.push(getFormattedDate(endDate));

  // deduplicate
  formatted = [...new Set(formatted)];

  return formatted.join(" tot ");
}
