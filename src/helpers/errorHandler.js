const errorHandler = (err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "The user is not authorized" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({
    message: "An unexpected error occurred",
    error: err.message,
  });
};

export default errorHandler;
