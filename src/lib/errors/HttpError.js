export class HttpError extends Error {
  constructor(payload) {
    super(payload.message);
    this.name = 'HttpError';
    this.payload = payload;
  }
}

export class EntityError extends HttpError {
  constructor(payload) {
    super(payload);
    this.name = 'EntityError';
  }
}
