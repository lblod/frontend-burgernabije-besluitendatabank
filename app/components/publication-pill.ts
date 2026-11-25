import Component from '@glimmer/component';

export type PublicationStatus = 'not-published' | 'on-time' | 'late';

interface PublicationPillArgs {
  status?: PublicationStatus | null;
}

const DISPLAY: Record<
  PublicationStatus,
  { skin: string; icon: string; label: string }
> = {
  'not-published': {
    skin: 'error',
    icon: 'circle-x',
    label: 'Niet gepubliceerd',
  },
  'on-time': {
    skin: 'success',
    icon: 'circle-check',
    label: 'Tijdig gepubliceerd',
  },
  late: {
    skin: 'warning',
    icon: 'alert-triangle',
    label: 'Te laat gepubliceerd',
  },
};

export default class PublicationPill extends Component<PublicationPillArgs> {
  get display() {
    return DISPLAY[this.args.status ?? 'not-published'];
  }
}
