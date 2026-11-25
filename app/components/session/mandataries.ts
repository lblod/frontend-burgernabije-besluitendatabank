import Component from '@glimmer/component';

import type SessionModel from 'frontend-burgernabije-besluitendatabank/models/session';

interface Signature {
  Args: { session: SessionModel };
}

export default class SessionMandataries extends Component<Signature> {
  get matchedCount() {
    return 10;
  }

  get totalCount() {
    return 14;
  }
}
