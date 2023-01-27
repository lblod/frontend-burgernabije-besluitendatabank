import Controller from "@ember/controller";
import { tracked } from "@glimmer/tracking";

export default class IndexController extends Controller {
  @tracked options = [
    "Advies bij jaarrekening AGB",
    "Advies bij jaarrekening eredienstbestuur",
    "Agenda",
    "Andere documenten BBC",
    "Besluit budget AGB",
    "Besluit meerjarenplan(aanpassing) AGB",
    "Besluit over budget(wijziging) eredienstbestuur",
    "Besluit over budget(wijziging) OCMW-vereniging",
    "Besluitenlijst",
    "Budget",
    "Goedkeuringstoezicht Voeren",
    "Meerjarenplan(aanpassing)",
    "Notulen",
    "Oprichting autonoom bedrijf",
    "Oprichting districtbestuur",
  ];
}
