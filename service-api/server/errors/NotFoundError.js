import ApplicationError from './ApplicationError';

class NotFoundError extends ApplicationError {
  constructor(module, name, message) {
    super(module, name, message || 'Not found.', 404);
  }
}
export default NotFoundError;
