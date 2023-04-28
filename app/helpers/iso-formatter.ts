import { helper } from "@ember/component/helper";
import { format, parseISO } from "date-fns";

export default function isoFormatter(date: string|Date) {
  if (typeof(date) == 'string') {
    date = parseISO(date)
  }
  return format(date, "MM/dd/yyyy");
}
