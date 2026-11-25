import Component from '@glimmer/component';

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';

interface Signature {
  Args: { session: SessionModel };
}

type Tab = {
  key: string;
  label: string;
  issueCount: number;
};

const TABS: Tab[] = [
  { key: 'agenda', label: 'Agenda', issueCount: 2 },
  { key: 'besluitenlijst', label: 'Besluitenlijst', issueCount: 0 },
  { key: 'notulen', label: 'Notulen', issueCount: 1 },
];

export default class SessionValidationIssues extends Component<Signature> {
  tabs = TABS;

  @tracked activeTab = 'agenda';

  get activeTabLabel() {
    const tab = TABS.find((candidate) => {
      return candidate.key === this.activeTab;
    });

    return tab?.label ?? '';
  }

  get issueCount() {
    return TABS.reduce((total, tab) => {
      return total + tab.issueCount;
    }, 0);
  }

  @action
  selectTab(key: string) {
    this.activeTab = key;
  }
}
