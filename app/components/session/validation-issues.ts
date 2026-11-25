import Component from '@glimmer/component';

import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';

interface Signature {
  Args: { session: SessionModel };
}

export default class SessionValidationIssues extends Component<Signature> {
  get issueCount() {
    return 4;
  }
}
