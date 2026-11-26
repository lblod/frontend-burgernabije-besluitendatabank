import Controller from '@ember/controller';

export default class AuthCallbackController extends Controller {
  queryParams = ['code', 'state', 'error'];
  code: string | null = null;
  state: string | null = null;
  error: string | null = null;
}
