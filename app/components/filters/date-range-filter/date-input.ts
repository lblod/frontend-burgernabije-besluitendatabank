import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

interface Signature {
  Element: HTMLInputElement;
  Args: {
    value?: string;
    onChange?: (newDate: string | null) => void;
    onBlur?: (event: Event) => void;
    onError?: () => void;
  };
}

export default class DateInput extends Component<Signature> {
  @tracked error = false;

  handleChange = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    this.args.onChange?.(value ? value : null);
  };

  handleBlur = (event: Event) => {
    this.args.onBlur?.(event);
  };

  handleError = (error: boolean) => {
    this.error = error;
  };
}
