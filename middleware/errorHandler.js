const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const formatMongooseValidationError = (error) =>
  Object.values(error.errors).map((err) => ({
    field: err.path,
    message: err.message,
  }));

const formatDuplicateKeyError = (error) => {
  const duplicateFields = Object.keys(error.keyValue || {});

  return duplicateFields.map((field) => ({
    field,
    message: `${field} already exists`,
  }));
};

const withDevStack = (payload, err) => {
  if (process.env.NODE_ENV === "development") {
    return {
      ...payload,
      stack: err.stack,
    };
  }

  return payload;
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: withDevStack({
        code: 400,
        message: "Validation failed",
        details: formatMongooseValidationError(err),
      }, err),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      error: withDevStack({
        code: 400,
        message: "Duplicate value error",
        details: formatDuplicateKeyError(err),
      }, err),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: withDevStack({
        code: 400,
        message: "Invalid resource identifier",
      }, err),
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: withDevStack({
        code: 401,
        message: "Invalid or expired token",
      }, err),
    });
  }

  const statusCode = err.statusCode || 500;
  const defaultMessage = statusCode === 500 ? "Internal server error" : "Request failed";

  return res.status(statusCode).json({
    error: withDevStack({
      code: statusCode,
      message: err.message || defaultMessage,
    }, err),
  });
};

module.exports = {
  notFound,
  errorHandler,
};
