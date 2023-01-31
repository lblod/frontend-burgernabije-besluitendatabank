import { helper } from "@ember/component/helper";
import { format, parseISO } from "date-fns";

export default function isoFormatter(date: string) {
  return format(parseISO(date), "MM/dd/yyyy");
}
