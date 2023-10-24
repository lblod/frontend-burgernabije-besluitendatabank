// add types for toaster service

// Path: types/appuniversum/ember-appuniversum/addon/services/toaster.d.ts

declare module '@appuniversum/ember-appuniversum/addon/services/toaster' {
  import A from '@ember/array';
  import Service from '@ember/service';
  import { tracked } from '@glimmer/tracking';

  export default class ToasterService extends Service {
    @tracked toasts: A<unknown>;

    displayToast(toast: unknown): unknown;

    show(component: unknown, options?: unknown): unknown;
    notify(message: string, title: string, options?: unknown): unknown;
    success(message: string, title: string, options?: unknown): unknown;
    warning(message: string, title: string, options?: unknown): unknown;
    error(message: string, title: string, options?: unknown): unknown;
    loading(message: string, title: string, options?: unknown): unknown;
    close(toast: unknown): unknown;
  }
}
