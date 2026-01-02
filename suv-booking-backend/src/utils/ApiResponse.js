class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  // Static methods for common responses
  static success(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  static created(data, message = 'Created') {
    return new ApiResponse(201, data, message);
  }

  static noContent(message = 'No Content') {
    return new ApiResponse(204, null, message);
  }
}

module.exports = ApiResponse;