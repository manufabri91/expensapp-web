export class RegisterError extends Error {
  constructor(reason: string) {
    super(`System.ERRORS.${reason}`);
    this.name = 'RegisterError';
  }
}
