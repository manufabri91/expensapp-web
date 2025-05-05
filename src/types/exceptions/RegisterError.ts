export class RegisterError extends Error {
  constructor(reason: string) {
    super(`Registration failed: ${reason}`);
    this.name = 'RegisterError';
  }
}
