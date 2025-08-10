class ApplicationError extends Error {
  constructor(err) {
    super();

    Error.captureStackTrace(this, this.constructor);
    this.module = err.module;
    this.name = err.name || this.constructor.name;
    this.type = err.type || 'UleecoServerError';
    this.message = err.message
      || 'Something went wrong. Please try again.';

    this.statusCode = err.statusCode || 500;
    this.responseCode = err.responseCode;
  }
}

export default ApplicationError;
