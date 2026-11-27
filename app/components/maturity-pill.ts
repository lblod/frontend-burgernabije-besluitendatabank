import Component from '@glimmer/component';

interface MaturityPillArgs {
  /** The maturity level, either as a number or as a string like `Niveau 2`. */
  level?: number | string | null;
}

/**
 * Shows a maturity level the same way everywhere: as a pill whose colour
 * depends on the level.
 */
export default class MaturityPill extends Component<MaturityPillArgs> {
  get level(): number | null {
    const level = this.args.level;
    if (typeof level === 'number') {
      return level;
    }

    const match = level?.match(/\d+/);
    if (!match) {
      return null;
    }

    return Number(match[0]);
  }

  get skin() {
    switch (this.level) {
      case 1:
        return 'error';
      case 2:
        return 'warning';
      case 3:
        return 'success';
      default:
        return 'border';
    }
  }

  get label() {
    const base = 'Maturiteitsniveau ';
    if (this.level === null) {
      return base + 'onbekend';
    }

    return base + this.level;
  }
}
