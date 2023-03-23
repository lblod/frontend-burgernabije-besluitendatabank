import ENV from "frontend-burgernabije-besluitendatabank/config/environment";

export default function (server) {
  ENV.environment === "development" && server.createList("item", 300);
}
