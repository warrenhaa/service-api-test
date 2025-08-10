import ErrorCodes from '../../errors/ErrorCodes';

class ErrorCodesService {
  static async getAllErrorCodes() {
    const data = [];
    const obj = await ErrorCodes;
    for (const key in obj) {
      const element = obj[key];
      data.push(element);
    }
    if (!data) {
      const err = ErrorCodes['420000'];
      throw err;
    }
    return data;
  }
}

export default ErrorCodesService;
