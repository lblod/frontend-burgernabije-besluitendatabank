import Component from '@glimmer/component';

export type LinkStatus = 'linked' | 'not-linked' | 'not-found';

interface LinkPillArgs {
  status?: LinkStatus | null;
}

const DISPLAY: Record<
  LinkStatus,
  { skin: string; icon: string; label: string }
> = {
  linked: {
    skin: 'success',
    icon: 'circle-check',
    label: 'Correct gelinkt',
  },
  'not-linked': {
    skin: 'error',
    icon: 'circle-x',
    label: 'Niet gelinkt',
  },
  'not-found': {
    skin: 'warning',
    icon: 'alert-triangle',
    label: 'Link niet gevonden in mandatendatabank',
  },
};

export default class LinkPill extends Component<LinkPillArgs> {
  get display() {
    return DISPLAY[this.args.status ?? 'not-linked'];
  }
}
