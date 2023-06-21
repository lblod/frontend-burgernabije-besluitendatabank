import Controller from "@ember/controller";
import { service } from "@ember/service";
import KeywordStoreService from "frontend-burgernabije-besluitendatabank/services/keyword-store";

export default class DetailController extends Controller {
  @service declare keywordStore: KeywordStoreService;
}
