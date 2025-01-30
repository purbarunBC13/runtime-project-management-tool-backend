class ResponseHandler {
  /**
   * Send a standard response
   * @param {Object} res - The Express response object
   * @param {Number} statusCode - HTTP status code
   * @param {Boolean} success - Indicates success or failure
   * @param {String} message - Response message
   * @param {Object} [data] - Additional response data (optional)
   */
  static sendResponse(res, statusCode, success, message, data = null) {
    const response = {
      success,
      message,
    };

    if (data) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send a success response
   * @param {Object} res - The Express response object
   * @param {String} message - Success message
   * @param {Object} [data] - Additional response data (optional)
   * @param {Number} [statusCode=200] - HTTP status code (default is 200)
   */
  static success(res, message, data = null, statusCode = 200) {
    return this.sendResponse(res, statusCode, true, message, data);
  }

  /**
   * Send an error response
   * @param {Object} res - The Express response object
   * @param {String} message - Error message
   * @param {Number} [statusCode=500] - HTTP status code (default is 500)
   * @param {Object} [error] - Additional error details (optional)
   */
  static error(res, message, statusCode = 500, error = null) {
    const responseData = error ? { error } : null;
    return this.sendResponse(res, statusCode, false, message, responseData);
  }
}

export default ResponseHandler;
