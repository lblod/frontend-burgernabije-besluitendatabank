import Service, { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import config from "frontend-burgernabije-besluitendatabank/config/environment";

const MODULE = {
  SUPERVISION: "LoketLB-toezichtGebruiker",
  BERICHTENCENTRUM: "LoketLB-berichtenGebruiker",
  BBCDR: "LoketLB-bbcdrGebruiker",
  MANDATENBEHEER: "LoketLB-mandaatGebruiker",
  LEIDINGGEVENDENBEHEER: "LoketLB-leidinggevendenGebruiker",
  PERSONEELSBEHEER: "LoketLB-personeelsbeheer",
  SUBSIDIES: "LoketLB-subsidies",
  WORSHIP_MINISTER_MANAGEMENT: "LoketLB-eredienstBedienaarGebruiker",
  EREDIENSTMANDATENBEHEER: "LoketLB-eredienstMandaatGebruiker",
  PUBLIC_SERVICES: "LoketLB-LPDCGebruiker",
  WORSHIP_DECISIONS_DB: "LoketLB-databankEredienstenGebruiker",
  WORSHIP_ORGANISATIONS_DB: "LoketLB-eredienstOrganisatiesGebruiker",
};

export default class CurrentAuthSessionService extends Service {
  @service session: any;
  @service store: any;

  @tracked account: any;
  @tracked user: any;
  @tracked group: any;
  @tracked groupClassification: any;
  @tracked roles: any = [];

  async load() {
    if (this.session.isAuthenticated) {
      let accountId =
        this.session.data.authenticated.relationships.account.data.id;
      this.account = await this.store.findRecord("account", accountId, {
        include: "gebruiker",
      });

      this.user = await this.account.gebruiker;
      this.roles = this.session.data.authenticated.data.attributes.roles;

      let groupId = this.session.data.authenticated.relationships.group.data.id;
      this.group = await this.store.findRecord("bestuurseenheid", groupId, {
        include: "classificatie",
      });
      this.groupClassification = await this.group.classificatie;
    }
  }

  canAccess(role: any) {
    return this.roles.includes(role);
  }

  get hasViewOnlyWorshipMinistersManagementData() {
    return !!this.group.viewOnlyModules?.includes(
      MODULE.WORSHIP_MINISTER_MANAGEMENT
    );
  }

  get hasViewOnlyWorshipMandateesManagementData() {
    return !!this.group.viewOnlyModules?.includes(
      MODULE.EREDIENSTMANDATENBEHEER
    );
  }

  get canAccessWorshipDecisionsDb() {
    return (
      this.canAccess(MODULE.WORSHIP_DECISIONS_DB) &&
      !config.worshipDecisionsDatabaseUrl.startsWith("{{")
    );
  }

  get canAccessWorshipOrganisationsDb() {
    return (
      this.canAccess(MODULE.WORSHIP_ORGANISATIONS_DB) &&
      !config.worshipOrganisationsDatabaseUrl.startsWith("{{")
    );
  }

  get canAccessToezicht() {
    return this.canAccess(MODULE.SUPERVISION);
  }

  get canAccessBbcdr() {
    return this.canAccess(MODULE.BBCDR);
  }

  get canAccessMandaat() {
    return this.canAccess(MODULE.MANDATENBEHEER);
  }

  get canAccessBerichten() {
    return this.canAccess(MODULE.BERICHTENCENTRUM);
  }

  get canAccessLeidinggevenden() {
    return this.canAccess(MODULE.LEIDINGGEVENDENBEHEER);
  }

  get canAccessPersoneelsbeheer() {
    return this.canAccess(MODULE.PERSONEELSBEHEER);
  }

  get canAccessSubsidies() {
    return this.canAccess(MODULE.SUBSIDIES);
  }

  get canAccessWorshipMinisterManagement() {
    return this.canAccess(MODULE.WORSHIP_MINISTER_MANAGEMENT);
  }

  get canAccessEredienstMandatenbeheer() {
    return this.canAccess(MODULE.EREDIENSTMANDATENBEHEER);
  }

  get canAccessPublicServices() {
    return this.canAccess(MODULE.PUBLIC_SERVICES);
  }
}
