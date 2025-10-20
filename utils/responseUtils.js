const successResponse = (res, data, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (
  res,
  message = "Error",
  statusCode = 500,
  errors = null
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const validationError = (res, errors) => {
  return errorResponse(res, "Validation failed", 422, errors);
};

const notFoundError = (res, resource = "Resource") => {
  return errorResponse(res, `${resource} not found`, 404);
};

const unauthorizedError = (res, message = "Unauthorized") => {
  return errorResponse(res, message, 401);
};

module.exports = {
  successResponse,
  errorResponse,
  validationError,
  notFoundError,
  unauthorizedError,
};
